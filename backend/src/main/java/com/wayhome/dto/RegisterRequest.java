package com.wayhome.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/** Payload for user registration. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {

    @NotBlank
    private String name;

    @Email @NotBlank
    private String email;

    private String phone;

    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    /** ADMIN / PROPERTY_MANAGER / TENANT / STUDENT */
    @NotBlank
    private String role;
}
