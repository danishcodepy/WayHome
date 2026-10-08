package com.wayhome.controller;

import com.wayhome.exception.ForbiddenException;
import com.wayhome.model.Application;
import com.wayhome.model.Property;
import com.wayhome.model.Role;
import com.wayhome.model.User;
import com.wayhome.service.ApplicationService;
import com.wayhome.service.PropertyService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;
    private final PropertyService propertyService;

    @PostMapping
    public ResponseEntity<?> apply(@RequestParam(required = false) Long propertyId,
                                   @RequestParam(required = false) Long tenantId,
                                   @RequestBody(required = false) ApplyRequest body,
                                   Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        Long resolvedPropertyId = propertyId != null ? propertyId : (body == null ? null : body.getPropertyId());
        if (resolvedPropertyId == null) return ResponseEntity.badRequest().body("propertyId is required");
        if (tenantId != null && !actor.getId().equals(tenantId) && actor.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only apply for yourself");
        }
        Long applicantId = actor.getRole() == Role.ADMIN && tenantId != null ? tenantId : actor.getId();
        if (actor.getRole() != Role.TENANT && actor.getRole() != Role.STUDENT && actor.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only tenants can submit rental applications");
        }
        Application saved = applicationService.apply(
                resolvedPropertyId,
                applicantId,
                body == null ? null : body.getPhone(),
                body == null ? null : body.getMessage(),
                body == null || body.getMoveInDate() == null || body.getMoveInDate().isBlank() ? null : LocalDate.parse(body.getMoveInDate())
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<?> listAll(Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() == Role.ADMIN) return ResponseEntity.ok(applicationService.listAll());
        if (actor.getRole() == Role.PROPERTY_MANAGER) return ResponseEntity.ok(applicationService.listByOwner(actor.getId()));
        return ResponseEntity.ok(applicationService.listByTenant(actor.getId()));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<?> listByTenant(@PathVariable Long tenantId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (!actor.getId().equals(tenantId) && actor.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        return ResponseEntity.ok(applicationService.listByTenant(tenantId));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> listByProperty(@PathVariable Long propertyId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        Property property = propertyService.getById(propertyId);
        boolean owner = property.getOwner() != null && actor.getId().equals(property.getOwner().getId());
        if (actor.getRole() != Role.ADMIN && !owner) {
            throw new ForbiddenException("Access denied");
        }
        return ResponseEntity.ok(applicationService.listByProperty(propertyId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> listByOwner(@PathVariable Long ownerId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (!actor.getId().equals(ownerId) && actor.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        return ResponseEntity.ok(applicationService.listByOwner(ownerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        boolean admin = actor.getRole() == Role.ADMIN;
        if (!admin && actor.getRole() != Role.PROPERTY_MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only property managers can review applications");
        }
        return ResponseEntity.ok(applicationService.updateStatus(id, status, actor.getId(), admin));
    }

    @Data
    public static class ApplyRequest {
        private Long propertyId;
        private String phone;
        private String message;
        private String moveInDate;
    }
}
