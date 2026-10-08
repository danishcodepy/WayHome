package com.wayhome.controller;

import com.wayhome.model.AuditLog;
import com.wayhome.model.User;
import com.wayhome.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<?> getAllLogs(Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can view audit logs");
        }
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/actor/{actorId}")
    public ResponseEntity<?> getLogsByActor(@PathVariable Long actorId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can view audit logs");
        }
        return ResponseEntity.ok(auditLogService.getLogsByActor(actorId));
    }

    @GetMapping("/entity")
    public ResponseEntity<?> getLogsByEntity(@RequestParam String entityType, @RequestParam Long entityId,
            Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can view audit logs");
        }
        return ResponseEntity.ok(auditLogService.getLogsByEntity(entityType, entityId));
    }
}