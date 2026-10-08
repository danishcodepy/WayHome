package com.wayhome.config;

import com.wayhome.model.SystemSetting;
import com.wayhome.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(50)
@RequiredArgsConstructor
public class SystemSettingInitializer implements CommandLineRunner {
    private final SystemSettingRepository repository;

    @Override
    public void run(String... args) {
        List<SystemSetting> defaults = List.of(
                SystemSetting.builder().key("maintenance_mode").value("false").description("Put the platform into maintenance mode when required.").updatedAt(LocalDateTime.now()).build(),
                SystemSetting.builder().key("listing_auto_approval").value("false").description("Whether new property listings should be automatically approved.").updatedAt(LocalDateTime.now()).build(),
                SystemSetting.builder().key("notifications_enabled").value("true").description("Enable in-app notifications for workflow events.").updatedAt(LocalDateTime.now()).build()
        );
        defaults.forEach(s -> { if (!repository.existsByKey(s.getKey())) repository.save(s); });
    }
}
