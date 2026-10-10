package com.wayhome.controller;

import com.wayhome.dto.AuthResponse;
import com.wayhome.dto.SendOtpRequest;
import com.wayhome.dto.VerifyOtpRequest;
import com.wayhome.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Passwordless Email-OTP login endpoints.
 *
 * <p>Endpoints are mounted under {@code /api/auth/otp} so they
 * sit inside the existing {@code /api/auth/**} permit-all rule
 * in {@link com.wayhome.security.SecurityConfig}.
 */
@RestController
@RequestMapping("/api/auth/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    /**
     * POST /api/auth/otp/send
     *
     * <p>Generates a 6-digit OTP, stores a BCrypt hash, and emails the plain code
     * to the user via Brevo. The plain code is NEVER returned in the response.
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        try {
            Map<String, String> result = otpService.sendLoginOtp(request.getEmail());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            // Account not found, cooldown violation, blocked account …
            String msg = e.getMessage();
            if (msg != null && msg.startsWith("No account found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", msg));
            }
            if (msg != null && msg.startsWith("Please wait")) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of("message", msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", msg != null ? msg : "Invalid request."));
        } catch (RuntimeException e) {
            // Brevo API failure or configuration error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null
                            ? e.getMessage()
                            : "Failed to send OTP email. Please try again later."));
        }
    }

    /**
     * POST /api/auth/otp/verify
     *
     * <p>Validates the submitted OTP and returns the same {@link AuthResponse}
     * produced by normal email/password login.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            AuthResponse response = otpService.verifyLoginOtp(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Invalid OTP.";

            if (msg.contains("expired")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", msg));
            }
            if (msg.contains("Too many")) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of("message", msg));
            }
            // Invalid OTP / no record / already used
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", msg));
        }
    }
}
