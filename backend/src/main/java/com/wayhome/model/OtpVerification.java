package com.wayhome.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Stores a single OTP request.
 * The OTP itself is NEVER stored in plain text — only its BCrypt hash is persisted.
 */
@Entity
@Table(name = "otp_verification", indexes = {
        @Index(name = "idx_otp_email_purpose", columnList = "email, purpose")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Normalised (lower-cased, trimmed) email address. */
    @Column(nullable = false, length = 320)
    private String email;

    /** BCrypt hash of the 6-digit OTP — never the plain-text code. */
    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    /** When this OTP record was created. */
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /** Absolute expiry moment (createdAt + 5 min). */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /** Number of failed verification attempts made against this OTP. */
    @Builder.Default
    private int attempts = 0;

    /** True once the OTP has been successfully verified and consumed. */
    @Builder.Default
    private boolean used = false;

    /**
     * Purpose tag — currently only "LOGIN" is used,
     * but the field is kept for future extensibility (e.g. "REGISTER").
     */
    @Column(nullable = false, length = 30)
    private String purpose;
}
