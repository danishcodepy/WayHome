package com.wayhome.dto;

import lombok.*;

/** Returned after successful register / login. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {

    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
}
