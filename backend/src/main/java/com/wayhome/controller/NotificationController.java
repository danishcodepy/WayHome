package com.wayhome.controller;

import com.wayhome.model.User;
import com.wayhome.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> listForUser(@PathVariable Long userId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (!actor.getId().equals(userId) && actor.getRole() != com.wayhome.model.Role.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        return ResponseEntity.ok(notificationService.listForUser(userId));
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<?> unreadCount(@PathVariable Long userId, Authentication authentication) {
        User actor=(User)authentication.getPrincipal();
        if(!actor.getId().equals(userId) && actor.getRole()!=com.wayhome.model.Role.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        return ResponseEntity.ok(notificationService.unreadCount(userId));
    }

    @PutMapping("/read-all/{userId}")
    public ResponseEntity<?> markAllRead(@PathVariable Long userId, Authentication authentication) {
        User actor=(User)authentication.getPrincipal();
        if(!actor.getId().equals(userId) && actor.getRole()!=com.wayhome.model.Role.ADMIN) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        notificationService.markAllRead(userId); return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        try { return ResponseEntity.ok(notificationService.markRead(id, actor.getId(), actor.getRole() == com.wayhome.model.Role.ADMIN)); }
        catch (IllegalArgumentException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }
}
