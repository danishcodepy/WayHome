package com.wayhome.controller;

import com.wayhome.dto.CreateUserRequest;
import com.wayhome.model.Role;
import com.wayhome.model.User;
import com.wayhome.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateUserRequest req, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can create users");
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(req, actor.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listAll(@RequestParam(required = false) String search,
                                     @RequestParam(required = false) String role,
                                     @RequestParam(required = false) String status,
                                     Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can list users");
        }
        return ResponseEntity.ok(userService.list(search, role, status));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        User p = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getById(p.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(Authentication authentication, @RequestBody User changes) {
        User p = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.update(p.getId(), changes, p.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (!actor.getId().equals(id) && actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody User changes, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can update other users");
        }
        return ResponseEntity.ok(userService.update(id, changes, actor.getId()));
    }

    @PutMapping("/{id}/block")
    public ResponseEntity<?> blockUnblock(@PathVariable Long id, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can block users");
        }
        return ResponseEntity.ok(userService.blockUnblock(id, actor.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        if (actor.getRole() != com.wayhome.model.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can delete users");
        }
        userService.delete(id, actor.getId());
        return ResponseEntity.noContent().build();
    }
}
