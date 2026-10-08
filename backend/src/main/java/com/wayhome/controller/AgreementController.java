package com.wayhome.controller;

import com.wayhome.dto.RentalHistoryResponse;
import com.wayhome.model.Agreement;
import com.wayhome.model.User;
import com.wayhome.service.AgreementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agreements")
@RequiredArgsConstructor
public class AgreementController {
    private final AgreementService agreementService;

    @GetMapping
    public ResponseEntity<?> listAll(Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != com.wayhome.model.Role.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can view all agreements");
        return ResponseEntity.ok(agreementService.listAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestParam Long applicationId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        boolean admin = actor.getRole() == com.wayhome.model.Role.ADMIN;
        if (!admin && actor.getRole() != com.wayhome.model.Role.PROPERTY_MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only property managers can create agreements");
        }
        try {
            Agreement agreement = agreementService.createFromApplication(applicationId, actor.getId(), admin);
            return ResponseEntity.status(HttpStatus.CREATED).body(agreement);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        try {
            Agreement agreement = agreementService.getById(id);
            if (actor.getRole() != com.wayhome.model.Role.ADMIN
                    && !actor.getId().equals(agreement.getTenant().getId())
                    && !actor.getId().equals(agreement.getOwner().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            return ResponseEntity.ok(agreement);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<?> listByTenant(@PathVariable Long tenantId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (!actor.getId().equals(tenantId) && actor.getRole() != com.wayhome.model.Role.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        return ResponseEntity.ok(agreementService.listByTenant(tenantId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> listByOwner(@PathVariable Long ownerId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (!actor.getId().equals(ownerId) && actor.getRole() != com.wayhome.model.Role.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        return ResponseEntity.ok(agreementService.listByOwner(ownerId));
    }

    @GetMapping("/history/me")
    public ResponseEntity<?> getMyRentalHistory(Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        return ResponseEntity.ok(agreementService.getRentalHistory(actor.getId()));
    }

    @GetMapping("/history/{tenantId}")
    public ResponseEntity<?> getRentalHistory(@PathVariable Long tenantId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (!actor.getId().equals(tenantId) && actor.getRole() != com.wayhome.model.Role.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        return ResponseEntity.ok(agreementService.getRentalHistory(tenantId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        boolean admin = actor.getRole() == com.wayhome.model.Role.ADMIN;
        if (!admin && actor.getRole() != com.wayhome.model.Role.PROPERTY_MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only property managers can update agreements");
        }
        return ResponseEntity.ok(agreementService.updateStatus(id, status, actor.getId(), admin));
    }
}
