package com.wayhome.service;

import com.wayhome.model.SystemSetting;
import com.wayhome.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemSettingService {
    private final SystemSettingRepository repository;
    private final AuditLogService auditLogService;

    public List<SystemSetting> list() { return repository.findAll(); }

    public SystemSetting get(String key) {
        return repository.findByKey(key).orElseThrow(() -> new IllegalArgumentException("Setting not found: " + key));
    }

    public SystemSetting save(String key, String value, String description, Long actorId) {
        if (key == null || key.isBlank()) throw new IllegalArgumentException("Setting key is required");
        SystemSetting setting = repository.findByKey(key.trim()).orElseGet(SystemSetting::new);
        setting.setKey(key.trim());
        setting.setValue(value == null ? "" : value);
        if (description != null) setting.setDescription(description);
        setting.setUpdatedAt(LocalDateTime.now());
        SystemSetting saved = repository.save(setting);
        auditLogService.log(actorId, "UPDATE", "SystemSetting", saved.getId(), "Setting changed: " + saved.getKey());
        return saved;
    }

    public void delete(String key, Long actorId) {
        SystemSetting setting = get(key);
        repository.delete(setting);
        auditLogService.log(actorId, "DELETE", "SystemSetting", setting.getId(), "Setting deleted: " + key);
    }
}
