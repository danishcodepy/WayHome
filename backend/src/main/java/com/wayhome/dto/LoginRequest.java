package com.wayhome.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/** Payload for login requests. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {

    @Email @NotBlank
    private String email;

    @NotBlank
    private String password;

    /** Optional expected role (ADMIN / PROPERTY_MANAGER / TENANT / STUDENT). */
    private String role;
}
