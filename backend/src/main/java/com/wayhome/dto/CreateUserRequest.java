package com.wayhome.dto;

import com.wayhome.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/** DTO for Admin User Creation. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    /** ADMIN / PROPERTY_MANAGER / TENANT / STUDENT */
    @NotBlank(message = "Role is required")
    private String role;

    /** "Active" or "Blocked" */
    private String status;
}
