package com.wayhome.controller;

import com.wayhome.model.Property;
import com.wayhome.model.Role;
import com.wayhome.model.User;
import com.wayhome.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {
    private final PropertyService propertyService;

    @GetMapping
    public ResponseEntity<List<Property>> list(@RequestParam(required = false) String city,
                                                @RequestParam(required = false) String location,
                                                @RequestParam(required = false) String type,
                                                @RequestParam(required = false) Double minRent,
                                                @RequestParam(required = false) Double maxRent,
                                                @RequestParam(required = false) Integer bedrooms,
                                                @RequestParam(required = false) String furnishing,
                                                @RequestParam(required = false) String listingFor,
                                                @RequestParam(required = false) String amenities) {
        return ResponseEntity.ok(propertyService.search(city, location, type, minRent, maxRent, bedrooms, furnishing, listingFor, amenities));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, Authentication authentication) {
        Property property = propertyService.getById(id);
        if ("APPROVED".equalsIgnoreCase(property.getStatus())) {
            return ResponseEntity.ok(property);
        }
        if (authentication == null || !(authentication.getPrincipal() instanceof User actor)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Property is not publicly available");
        }
        boolean owner = property.getOwner() != null && actor.getId().equals(property.getOwner().getId());
        if (actor.getRole() == Role.ADMIN || owner) return ResponseEntity.ok(property);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Property is not publicly available");
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Property property, @RequestParam(required = false) Long ownerId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.PROPERTY_MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only property managers and administrators can list properties");
        }
        Long resolvedOwner = (actor.getRole() == Role.ADMIN && ownerId != null) ? ownerId : actor.getId();
        return ResponseEntity.status(HttpStatus.CREATED).body(propertyService.submit(property, resolvedOwner));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Property changes, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.PROPERTY_MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only property managers and administrators can update properties");
        }
        return ResponseEntity.ok(propertyService.update(id, changes, actor.getId(), actor.getRole() == Role.ADMIN));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        return ResponseEntity.ok(propertyService.approve(id, actor.getId()));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestParam(required = false) String reason, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        return ResponseEntity.ok(propertyService.reject(id, reason, actor.getId()));
    }

    @GetMapping({"/owner", "/owner/{ownerId}"})
    public ResponseEntity<?> listByOwner(@PathVariable(required = false) Long ownerId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        Long targetOwnerId = (ownerId != null) ? ownerId : actor.getId();
        if (!actor.getId().equals(targetOwnerId) && actor.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        return ResponseEntity.ok(propertyService.listByOwner(targetOwnerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.PROPERTY_MANAGER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only property managers and administrators can delete properties");
        }
        propertyService.delete(id, actor.getId(), actor.getRole() == Role.ADMIN);
        return ResponseEntity.noContent().build();
    }
}
