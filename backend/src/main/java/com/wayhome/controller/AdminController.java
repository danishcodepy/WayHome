package com.wayhome.controller;

import com.wayhome.model.Role;
import com.wayhome.model.User;
import com.wayhome.repository.AgreementRepository;
import com.wayhome.repository.ApplicationRepository;
import com.wayhome.repository.PropertyRepository;
import com.wayhome.repository.UserRepository;
import com.wayhome.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;
    private final UserService userService;
    private final PropertyRepository propertyRepository;
    private final ApplicationRepository applicationRepository;
    private final AgreementRepository agreementRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String,Object>> stats() {
        Map<String,Object> stats=new HashMap<>();
        stats.put("totalUsers",userRepository.count()); stats.put("totalProperties",propertyRepository.count());
        stats.put("pendingApprovals",propertyRepository.findByStatus("PENDING").size()); stats.put("activeRentals",agreementRepository.findByStatus("Active").size());
        stats.put("pendingApplications",applicationRepository.findByStatus("Pending").size()); return ResponseEntity.ok(stats);
    }
    @GetMapping("/properties") public ResponseEntity<?> properties(){return ResponseEntity.ok(propertyRepository.findAll());}
    @GetMapping("/applications") public ResponseEntity<?> applications(){return ResponseEntity.ok(applicationRepository.findAll());}
    @GetMapping("/agreements") public ResponseEntity<?> agreements(){return ResponseEntity.ok(agreementRepository.findAll());}

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody com.wayhome.dto.CreateUserRequest req, Authentication authentication) {
        try {
            User actor = (User) authentication.getPrincipal();
            return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(req, actor.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id,@RequestParam String role,Authentication authentication){
        try { User actor=(User)authentication.getPrincipal(); Role newRole=Role.valueOf(role.trim().toUpperCase()); return ResponseEntity.ok(userService.changeRole(id,newRole,actor.getId())); }
        catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(e.getMessage());}
    }
}
