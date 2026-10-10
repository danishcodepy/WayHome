package com.wayhome.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/** Request body for POST /api/auth/otp/send */
@Getter
@Setter
public class SendOtpRequest {

    @Email(message = "Please provide a valid email address")
    @NotBlank(message = "Email is required")
    private String email;
}
