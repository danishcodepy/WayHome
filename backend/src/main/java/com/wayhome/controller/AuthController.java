package com.wayhome.controller;

import com.wayhome.dto.AuthResponse;
import com.wayhome.dto.LoginRequest;
import com.wayhome.dto.RegisterRequest;
import com.wayhome.dto.SendOtpRequest;
import com.wayhome.service.AuthService;
import com.wayhome.service.OtpService;
import com.wayhome.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final OtpService otpService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register/send-otp")
    public ResponseEntity<?> sendRegisterOtp(@Valid @RequestBody SendOtpRequest request) {
        try {
            return ResponseEntity.ok(otpService.sendRegistrationOtp(request.getEmail()));
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage();
            if (msg != null && msg.startsWith("Please wait")) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("message", msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", msg != null ? msg : "Invalid request."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to send verification email."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try { return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request)); }
        catch (IllegalArgumentException e) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage())); }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try { return ResponseEntity.ok(authService.login(request)); }
        catch (IllegalArgumentException e) { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage()); }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(passwordResetService.request(request.get("email")));
    }

    @PostMapping("/verify-reset")
    public ResponseEntity<?> verifyReset(@RequestBody Map<String, String> request) {
        try { return ResponseEntity.ok(Map.of("token", passwordResetService.verify(request.get("email"), request.get("code")))); }
        catch (IllegalArgumentException e) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try { passwordResetService.reset(request.get("token"), request.get("password")); return ResponseEntity.ok(Map.of("ok", true)); }
        catch (IllegalArgumentException e) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); }
    }
}
