package com.wayhome.controller;

import com.wayhome.model.User;
import com.wayhome.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant")
@RequiredArgsConstructor
public class TenantController {
    private final TenantService service;

    @GetMapping("/profile")
    public ResponseEntity<?> profile(Authentication authentication) {
        User actor=(User)authentication.getPrincipal();
        if (actor.getRole()!=com.wayhome.model.Role.TENANT && actor.getRole()!=com.wayhome.model.Role.STUDENT && actor.getRole()!=com.wayhome.model.Role.ADMIN)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tenant access required");
        return ResponseEntity.ok(service.profileWithHistory(actor.getId()));
    }
}
