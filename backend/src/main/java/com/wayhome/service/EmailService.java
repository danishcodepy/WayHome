package com.wayhome.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Sends transactional emails via the Brevo (formerly Sendinblue) API.
 *
 * <p>Required environment variables:
 * <ul>
 *   <li>BREVO_API_KEY – your Brevo API key (never committed to source)</li>
 *   <li>BREVO_SENDER_EMAIL – the verified sender address in Brevo</li>
 *   <li>BREVO_SENDER_NAME  – display name for the sender (default: WayHome)</li>
 * </ul>
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key:}")
    private String apiKey;

    @Value("${brevo.sender.email:}")
    private String senderEmail;

    @Value("${brevo.sender.name:WayHome}")
    private String senderName;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Sends a login OTP email.
     *
     * @param toEmail recipient's email address (already normalised)
     * @param otp     the plain-text 6-digit OTP (only used here; NOT logged)
     * @throws RuntimeException if the email cannot be sent
     */
    public void sendLoginOtp(String toEmail, String otp) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException(
                    "Brevo API key is not configured. Set the BREVO_API_KEY environment variable.");
        }
        if (senderEmail == null || senderEmail.isBlank()) {
            throw new RuntimeException(
                    "Brevo sender email is not configured. Set the BREVO_SENDER_EMAIL environment variable.");
        }

        String subject = "Your WayHome Login Verification Code";
        String htmlContent = buildOtpEmailHtml(otp);
        String textContent = buildOtpEmailText(otp);

        sendEmail(toEmail, subject, htmlContent, textContent);
    }

    /**
     * Sends a registration verification OTP email.
     *
     * @param toEmail recipient's email address (already normalised)
     * @param otp     the plain-text 6-digit OTP (only used here; NOT logged)
     * @throws RuntimeException if the email cannot be sent
     */
    public void sendRegistrationOtp(String toEmail, String otp) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException(
                    "Brevo API key is not configured. Set the BREVO_API_KEY environment variable.");
        }
        if (senderEmail == null || senderEmail.isBlank()) {
            throw new RuntimeException(
                    "Brevo sender email is not configured. Set the BREVO_SENDER_EMAIL environment variable.");
        }

        String subject = "Your WayHome Login Verification Code";
        String htmlContent = buildRegistrationOtpEmailHtml(otp);
        String textContent = buildRegistrationOtpEmailText(otp);

        sendEmail(toEmail, subject, htmlContent, textContent);
    }

    private void sendEmail(String toEmail, String subject, String htmlContent, String textContent) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // API key goes in the header — NEVER in a log statement
        headers.set("api-key", apiKey);
        headers.set("Accept", "application/json");

        Map<String, Object> payload = Map.of(
                "sender",  Map.of("name", senderName, "email", senderEmail),
                "to",      List.of(Map.of("email", toEmail)),
                "subject", subject,
                "htmlContent", htmlContent,
                "textContent", textContent
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            restTemplate.postForObject(BREVO_API_URL, entity, String.class);
            log.info("OTP email dispatched to {}", maskEmail(toEmail));
        } catch (Exception ex) {
            // Log the problem but NEVER log the API key or the OTP
            log.error("Failed to send OTP email to {}: {}", maskEmail(toEmail), ex.getMessage());
            throw new RuntimeException("Failed to send OTP email. Please try again later.");
        }
    }

    // ------------------------------------------------------------------ helpers

    private String buildOtpEmailHtml(String otp) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width,initial-scale=1"/>
                  <title>Your WayHome Login Verification Code</title>
                </head>
                <body style="margin:0;padding:0;background:#f5f6f8;font-family:Inter,Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:40px 0;">
                    <tr><td align="center">
                      <table width="560" cellpadding="0" cellspacing="0"
                             style="background:#ffffff;border-radius:12px;overflow:hidden;
                                    box-shadow:0 2px 16px rgba(0,0,0,.08);">
                        <!-- header -->
                        <tr>
                          <td style="background:#0d1b2a;padding:28px 40px;">
                            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                              WayHome
                            </span>
                          </td>
                        </tr>
                        <!-- body -->
                        <tr>
                          <td style="padding:40px;">
                            <h2 style="margin:0 0 20px;color:#0d1b2a;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
                              Your WayHome Login Verification Code
                            </h2>
                            <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">Hello,</p>
                            <p style="margin:0 0 24px;color:#444;font-size:14px;line-height:1.7;">
                              We received a request to sign in to your WayHome account.
                            </p>
                            <p style="margin:0 0 12px;color:#444;font-size:14px;line-height:1.7;">
                              Your verification code is:
                            </p>
                            <!-- OTP block -->
                            <div style="background:#f0f4ff;border-radius:10px;padding:28px;
                                        text-align:center;margin-bottom:24px;">
                              <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#1251e8;">
                                %s
                              </span>
                            </div>
                            <p style="margin:0 0 16px;color:#555;font-size:13px;line-height:1.7;">
                              This OTP is valid for <strong>5 minutes</strong>.
                            </p>
                            <p style="margin:0 0 16px;color:#555;font-size:13px;line-height:1.7;">
                              For your security, never share this code with anyone. WayHome will never ask you for your verification code.
                            </p>
                            <p style="margin:0 0 20px;color:#888;font-size:12px;line-height:1.7;">
                              If you did not request this code, you can safely ignore this email. No changes have been made to your account.
                            </p>
                            <p style="margin:0;color:#555;font-size:13px;line-height:1.7;">
                              Need help?<br/>
                              Please contact <a href="mailto:wayhome.connect@gmail.com" style="color:#1251e8;text-decoration:none;">WayHome Support</a>.
                            </p>
                          </td>
                        </tr>
                        <!-- footer -->
                        <tr>
                          <td style="background:#f8f9fb;padding:24px 40px;
                                     border-top:1px solid #edf0f4;">
                            <p style="margin:0 0 16px;color:#999;font-size:12px;line-height:1.6;">
                              Regards,<br/>
                              <strong style="color:#444;">WayHome Team</strong>
                            </p>
                            <p style="margin:0 0 4px;color:#666;font-size:12px;font-weight:600;">
                              Better places. Brighter futures.
                            </p>
                            <p style="margin:0;color:#aaa;font-size:11px;">
                              &copy; WayHome. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(otp);
    }

    private String buildOtpEmailText(String otp) {
        return """
                WayHome

                Your WayHome Login Verification Code

                Hello,

                We received a request to sign in to your WayHome account.

                Your verification code is:

                %s

                This OTP is valid for 5 minutes.

                For your security, never share this code with anyone. WayHome will never ask you for your verification code.

                If you did not request this code, you can safely ignore this email. No changes have been made to your account.

                Need help?
                Please contact WayHome Support.

                Regards,
                WayHome Team

                Better places. Brighter futures.

                © WayHome. All rights reserved.
                """.formatted(otp);
    }

    private String buildRegistrationOtpEmailHtml(String otp) {
        return buildOtpEmailHtml(otp);
    }

    private String buildRegistrationOtpEmailText(String otp) {
        return buildOtpEmailText(otp);
    }

    /** Masks an email for safe logging: e.g. us**@example.com */
    private static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        String domain = email.substring(at);
        if (local.length() <= 2) return "***" + domain;
        return local.substring(0, 2) + "**" + domain;
    }
}
