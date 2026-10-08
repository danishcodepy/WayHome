package com.wayhome.service;

import com.wayhome.model.AuditLog;
import com.wayhome.repository.AuditLogRepository;
import com.wayhome.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void log(Long actorId, String action, String entityType, Long entityId, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .actorId(actorId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : currentIp())
                .build();
        auditLogRepository.save(log);
    }

    public void log(Long actorId, String action, String entityType, Long entityId, String details) {
        log(actorId, action, entityType, entityId, details, currentIp());
    }

    public List<Map<String, Object>> getAllLogsEnriched() {
        return getAllLogs().stream().map(this::enrich).toList();
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getLogsByActor(Long actorId) {
        return auditLogRepository.findByActorIdOrderByTimestampDesc(actorId);
    }

    public List<AuditLog> getLogsByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    private Map<String, Object> enrich(AuditLog log) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", log.getId());
        row.put("actorId", log.getActorId());
        row.put("actorName", log.getActorId() == null ? "System" :
                userRepository.findById(log.getActorId()).map(user -> user.getName()).orElse("User #" + log.getActorId()));
        row.put("action", log.getAction());
        row.put("entityType", log.getEntityType());
        row.put("entityId", log.getEntityId());
        row.put("details", log.getDetails());
        row.put("timestamp", log.getTimestamp());
        row.put("ipAddress", log.getIpAddress());
        return row;
    }

    private String currentIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) return null;
            HttpServletRequest request = attributes.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
            return request.getRemoteAddr();
        } catch (Exception ignored) {
            return null;
        }
    }
}