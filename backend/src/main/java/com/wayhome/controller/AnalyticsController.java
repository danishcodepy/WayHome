package com.wayhome.controller;

import com.wayhome.model.User;
import com.wayhome.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AdminAnalyticsService analytics;

    @GetMapping("/admin")
    public ResponseEntity<?> admin(Authentication authentication) {
        User u=(User)authentication.getPrincipal();
        if (u.getRole()!=com.wayhome.model.Role.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can view reports");
        return ResponseEntity.ok(analytics.overview());
    }

    @GetMapping("/manager")
    public ResponseEntity<?> manager(Authentication authentication) {
        User u=(User)authentication.getPrincipal();
        if (u.getRole()!=com.wayhome.model.Role.PROPERTY_MANAGER && u.getRole()!=com.wayhome.model.Role.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only property managers can view listing analytics");
        return ResponseEntity.ok(analytics.manager(u.getId()));
    }
}
