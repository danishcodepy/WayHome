package com.wayhome.repository;

import com.wayhome.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    /** Most-recent unused, non-expired OTP for a given email+purpose. */
    Optional<OtpVerification> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, String purpose);

    /** All OTPs for email+purpose (used for cooldown / invalidation). */
    @Modifying
    @Transactional
    @Query("UPDATE OtpVerification o SET o.used = true WHERE o.email = :email AND o.purpose = :purpose AND o.used = false")
    int invalidateAll(@Param("email") String email, @Param("purpose") String purpose);

    /** Clean-up job: delete expired records. */
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpVerification o WHERE o.expiresAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") Instant cutoff);

    /** Latest OTP (any state) to enforce resend cooldown. */
    Optional<OtpVerification> findTopByEmailAndPurposeAndCreatedAtAfterOrderByCreatedAtDesc(
            String email, String purpose, Instant after);
}
