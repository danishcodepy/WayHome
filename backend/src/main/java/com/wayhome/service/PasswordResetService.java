package com.wayhome.service;

import com.wayhome.model.User;
import com.wayhome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private static final long CODE_TTL_SECONDS = 10 * 60;
    private static final long TOKEN_TTL_SECONDS = 10 * 60;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, ResetCode> codes = new ConcurrentHashMap<>();
    private final Map<String, ResetToken> tokens = new ConcurrentHashMap<>();

    public Map<String, Object> request(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalized).orElse(null);
        if (user == null) return Map.of("message", "If an account exists, a verification code has been generated.");
        String code = String.format("%06d", random.nextInt(1_000_000));
        codes.put(normalized, new ResetCode(code, Instant.now().plusSeconds(CODE_TTL_SECONDS)));
        // The project has no email provider configured. Returning devCode keeps local college demos testable.
        return Map.of("message", "Verification code generated for this local project.", "devCode", code, "expiresInSeconds", CODE_TTL_SECONDS);
    }

    public String verify(String email, String code) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        ResetCode saved = codes.get(normalized);
        if (saved == null || saved.expiresAt().isBefore(Instant.now()) || !saved.code().equals(code)) {
            throw new IllegalArgumentException("Invalid or expired verification code");
        }
        codes.remove(normalized);
        String token = UUID.randomUUID().toString();
        tokens.put(token, new ResetToken(normalized, Instant.now().plusSeconds(TOKEN_TTL_SECONDS)));
        return token;
    }

    public void reset(String token, String password) {
        if (password == null || password.length() < 8) throw new IllegalArgumentException("Password must contain at least 8 characters");
        ResetToken resetToken = tokens.remove(token);
        if (resetToken == null || resetToken.expiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("Invalid or expired reset token");
        User user = userRepository.findByEmail(resetToken.email()).orElseThrow(() -> new IllegalArgumentException("Account not found"));
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    private record ResetCode(String code, Instant expiresAt) {}
    private record ResetToken(String email, Instant expiresAt) {}
}
