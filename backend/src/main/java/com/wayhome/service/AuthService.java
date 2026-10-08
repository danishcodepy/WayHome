package com.wayhome.service;

import com.wayhome.dto.AuthResponse;
import com.wayhome.dto.LoginRequest;
import com.wayhome.dto.RegisterRequest;
import com.wayhome.model.Role;
import com.wayhome.model.User;
import com.wayhome.repository.UserRepository;
import com.wayhome.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/** Registration and login. */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /** Creates a new account; throws if the email is already registered. */
    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        Role role;
        try {
            role = Role.valueOf(req.getRole().trim().replace(' ', '_').toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + req.getRole());
        }
        if (role == Role.ADMIN) {
            throw new IllegalArgumentException("Admin accounts cannot be created through public registration");
        }
        User user = User.builder()
                .name(req.getName())
                .email(email)
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .status("Active")
                .build();
        user = userRepository.save(user);
        return toAuthResponse(user);
    }

    /** Verifies credentials and returns a signed JWT. */
    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        if (req.getRole() != null && !req.getRole().isBlank()) {
            String requestedRole = req.getRole().trim().replace(' ', '_').toUpperCase();
            if (!user.getRole().name().equals(requestedRole)) throw new IllegalArgumentException("This account uses a different role");
        }
        if ("Blocked".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("Account is blocked");
        }
        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
