package com.wayhome.controller;

import com.wayhome.model.User;
import com.wayhome.service.MessageService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody SendMessageRequest request, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(
                messageService.send(actor.getId(), request.getReceiverId(), request.getPropertyId(), request.getContent()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> userMessages(@PathVariable Long userId, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (!actor.getId().equals(userId) && actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        return ResponseEntity.ok(messageService.listForUser(userId));
    }

    @GetMapping("/conversation")
    public ResponseEntity<?> conversation(@RequestParam Long userA, @RequestParam Long userB, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (!actor.getId().equals(userA) && !actor.getId().equals(userB) && actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        Long other = actor.getId().equals(userA) ? userB : userA;
        if (actor.getRole() == com.wayhome.model.Role.ADMIN && !actor.getId().equals(userA) && !actor.getId().equals(userB)) {
            return ResponseEntity.ok(messageService.conversation(userA, userB));
        }
        return ResponseEntity.ok(messageService.conversation(actor.getId(), other));
    }

    @Getter @Setter
    public static class SendMessageRequest {
        private Long senderId;
        private Long receiverId;
        private Long propertyId;
        private String content;
    }
}
