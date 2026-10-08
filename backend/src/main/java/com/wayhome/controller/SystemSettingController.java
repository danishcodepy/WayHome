package com.wayhome.controller;

import com.wayhome.model.SystemSetting;
import com.wayhome.model.User;
import com.wayhome.service.SystemSettingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class SystemSettingController {
    private final SystemSettingService service;

    @GetMapping
    public ResponseEntity<?> list() { return ResponseEntity.ok(service.list()); }

    @PutMapping("/{key}")
    public ResponseEntity<?> save(@PathVariable String key, @RequestBody SettingRequest request, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        try { return ResponseEntity.ok(service.save(key, request.getValue(), request.getDescription(), actor.getId())); }
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<?> delete(@PathVariable String key, Authentication authentication) {
        User actor = (User) authentication.getPrincipal();
        try { service.delete(key, actor.getId()); return ResponseEntity.noContent().build(); }
        catch (IllegalArgumentException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @Data
    public static class SettingRequest { private String value; private String description; }
}
