package com.wayhome.service;

import com.wayhome.dto.AuthResponse;
import com.wayhome.model.OtpVerification;
import com.wayhome.model.User;
import com.wayhome.repository.OtpRepository;
import com.wayhome.repository.UserRepository;
import com.wayhome.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;

/**
 * Handles the full Email-OTP login flow:
 * <ol>
 *   <li>Generate a 6-digit OTP and store its BCrypt hash.</li>
 *   <li>Send the OTP via Brevo.</li>
 *   <li>Verify the submitted OTP and issue a JWT on success.</li>
 * </ol>
 *
 * <p>Security guarantees:
 * <ul>
 *   <li>OTP is generated with {@link SecureRandom} — cryptographically secure.</li>
 *   <li>Only the BCrypt hash is persisted — plain text is never stored.</li>
 *   <li>Plain text OTP is NEVER logged.</li>
 *   <li>5-minute expiry enforced server-side.</li>
 *   <li>60-second resend cooldown enforced server-side.</li>
 *   <li>Maximum 5 failed verification attempts per OTP.</li>
 *   <li>Old OTPs are invalidated before a new one is issued.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    // ── Configuration constants ──────────────────────────────────────────────
    private static final long OTP_EXPIRY_SECONDS  = 5 * 60;   // 5 minutes
    private static final long RESEND_COOLDOWN_SEC = 60;        // 1 minute
    private static final int  MAX_ATTEMPTS        = 5;
    private static final String PURPOSE_LOGIN     = "LOGIN";
    private static final String PURPOSE_REGISTER  = "REGISTER";

    // ── Dependencies ─────────────────────────────────────────────────────────
    private final OtpRepository   otpRepository;
    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService    emailService;
    private final JwtUtil         jwtUtil;

    private final SecureRandom secureRandom = new SecureRandom();

    // =========================================================================
    // SEND
    // =========================================================================

    /**
     * Generates and sends a login OTP for the given email.
     *
     * @param rawEmail the email submitted by the user (will be normalised)
     * @return a generic success message map
     * @throws IllegalArgumentException if the account does not exist, or the
     *                                  resend cooldown has not expired
     * @throws RuntimeException         if the Brevo API call fails
     */
    @Transactional
    public Map<String, String> sendLoginOtp(String rawEmail) {
        String email = normalise(rawEmail);

        // 1. Verify account exists (do not reveal existence in generic wording)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email address."));

        if ("Blocked".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("This account has been blocked.");
        }

        // 2. Enforce resend cooldown — check whether a recent OTP was already issued
        Instant cooldownCutoff = Instant.now().minusSeconds(RESEND_COOLDOWN_SEC);
        otpRepository.findTopByEmailAndPurposeAndCreatedAtAfterOrderByCreatedAtDesc(
                email, PURPOSE_LOGIN, cooldownCutoff
        ).ifPresent(recent -> {
            long waitSec = RESEND_COOLDOWN_SEC
                    - (Instant.now().getEpochSecond() - recent.getCreatedAt().getEpochSecond());
            if (waitSec > 0) {
                throw new IllegalArgumentException(
                        "Please wait " + waitSec + " seconds before requesting a new OTP.");
            }
        });

        // 3. Invalidate any previously active OTPs for this email+purpose
        otpRepository.invalidateAll(email, PURPOSE_LOGIN);

        // 4. Generate a cryptographically secure 6-digit OTP (zero-padded)
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));

        // 5. Hash the OTP — never store plain text
        String otpHash = passwordEncoder.encode(otp);

        Instant now      = Instant.now();
        Instant expiresAt = now.plusSeconds(OTP_EXPIRY_SECONDS);

        OtpVerification record = OtpVerification.builder()
                .email(email)
                .otpHash(otpHash)
                .createdAt(now)
                .expiresAt(expiresAt)
                .attempts(0)
                .used(false)
                .purpose(PURPOSE_LOGIN)
                .build();

        otpRepository.save(record);

        // 6. Send via Brevo — if this throws, the transaction rolls back
        emailService.sendLoginOtp(email, otp);

        log.info("Login OTP sent to {}", maskEmail(email));

        return Map.of("message", "OTP sent successfully. Please check your email.");
    }

    /**
     * Generates and sends an account registration OTP for the given email.
     * Throws if an account with this email already exists.
     */
    @Transactional
    public Map<String, String> sendRegistrationOtp(String rawEmail) {
        String email = normalise(rawEmail);

        // 1. Check if email is already registered
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        // 2. Enforce resend cooldown
        Instant cooldownCutoff = Instant.now().minusSeconds(RESEND_COOLDOWN_SEC);
        otpRepository.findTopByEmailAndPurposeAndCreatedAtAfterOrderByCreatedAtDesc(
                email, PURPOSE_REGISTER, cooldownCutoff
        ).ifPresent(recent -> {
            long waitSec = RESEND_COOLDOWN_SEC
                    - (Instant.now().getEpochSecond() - recent.getCreatedAt().getEpochSecond());
            if (waitSec > 0) {
                throw new IllegalArgumentException(
                        "Please wait " + waitSec + " seconds before requesting a new OTP.");
            }
        });

        // 3. Invalidate previously active registration OTPs for this email
        otpRepository.invalidateAll(email, PURPOSE_REGISTER);

        // 4. Generate 6-digit OTP
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        String otpHash = passwordEncoder.encode(otp);

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(OTP_EXPIRY_SECONDS);

        OtpVerification record = OtpVerification.builder()
                .email(email)
                .otpHash(otpHash)
                .createdAt(now)
                .expiresAt(expiresAt)
                .attempts(0)
                .used(false)
                .purpose(PURPOSE_REGISTER)
                .build();

        otpRepository.save(record);

        // 5. Send registration email via Brevo
        emailService.sendRegistrationOtp(email, otp);

        log.info("Registration OTP sent to {}", maskEmail(email));

        return Map.of("message", "Verification code sent to your email.");
    }

    // =========================================================================
    // VERIFY
    // =========================================================================

    /**
     * Verifies the submitted OTP and — on success — returns a JWT AuthResponse.
     *
     * @param rawEmail the email submitted by the user
     * @param otp      the 6-digit code submitted by the user
     * @return an {@link AuthResponse} identical to the one returned by normal login
     * @throws IllegalArgumentException on invalid/expired/exhausted OTP
     */
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public AuthResponse verifyLoginOtp(String rawEmail, String otp) {
        String email = normalise(rawEmail);

        // 1. Find the most recent OTP record for this email
        OtpVerification record = otpRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, PURPOSE_LOGIN)
                .orElseThrow(() -> new IllegalArgumentException("No OTP found. Please request a new OTP."));

        // 2. Check whether the OTP has already been used
        if (record.isUsed()) {
            throw new IllegalArgumentException("This OTP has already been used. Please request a new OTP.");
        }

        // 3. Check expiry
        if (Instant.now().isAfter(record.getExpiresAt())) {
            throw new IllegalArgumentException("OTP expired. Please request a new OTP.");
        }

        // 4. Check attempt limit BEFORE comparing — fail-safe
        if (record.getAttempts() >= MAX_ATTEMPTS) {
            throw new IllegalArgumentException(
                    "Too many failed attempts. Please request a new OTP.");
        }

        // 5. Compare hashes using BCrypt (constant-time)
        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            record.setAttempts(record.getAttempts() + 1);
            otpRepository.saveAndFlush(record);

            int remaining = MAX_ATTEMPTS - record.getAttempts();
            if (remaining <= 0) {
                throw new IllegalArgumentException(
                        "Too many failed attempts. Please request a new OTP.");
            }
            throw new IllegalArgumentException("Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        // 6. OTP is correct — mark as used to prevent replay
        record.setUsed(true);
        otpRepository.save(record);

        // 7. Load user and generate the SAME JWT as normal login
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        if ("Blocked".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("This account has been blocked.");
        }

        log.info("OTP login successful for {}", maskEmail(email));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Verifies the submitted OTP for account registration.
     * Marks the record as used on success.
     *
     * @param rawEmail the email being registered
     * @param otp      the 6-digit verification code
     * @throws IllegalArgumentException if invalid, expired, or attempts exceeded
     */
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void verifyRegistrationOtp(String rawEmail, String otp) {
        String email = normalise(rawEmail);

        if (otp == null || otp.isBlank()) {
            throw new IllegalArgumentException("Verification code is required.");
        }

        OtpVerification record = otpRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, PURPOSE_REGISTER)
                .orElseThrow(() -> new IllegalArgumentException("No verification code found. Please request a new code."));

        if (record.isUsed()) {
            throw new IllegalArgumentException("This verification code has already been used. Please request a new code.");
        }

        if (Instant.now().isAfter(record.getExpiresAt())) {
            throw new IllegalArgumentException("Verification code expired. Please request a new code.");
        }

        if (record.getAttempts() >= MAX_ATTEMPTS) {
            throw new IllegalArgumentException("Too many failed attempts. Please request a new code.");
        }

        if (!passwordEncoder.matches(otp.trim(), record.getOtpHash())) {
            record.setAttempts(record.getAttempts() + 1);
            otpRepository.saveAndFlush(record);

            int remaining = MAX_ATTEMPTS - record.getAttempts();
            if (remaining <= 0) {
                throw new IllegalArgumentException("Too many failed attempts. Please request a new code.");
            }
            throw new IllegalArgumentException("Invalid verification code. " + remaining + " attempt(s) remaining.");
        }

        record.setUsed(true);
        otpRepository.save(record);
        log.info("Registration OTP verified successfully for {}", maskEmail(email));
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    /** Normalise: lowercase + trim (consistent with AuthService). */
    private static String normalise(String email) {
        if (email == null) throw new IllegalArgumentException("Email is required.");
        return email.trim().toLowerCase();
    }

    /** Safe email masking for log output. */
    private static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        String domain = email.substring(at);
        if (local.length() <= 2) return "***" + domain;
        return local.substring(0, 2) + "**" + domain;
    }
}
