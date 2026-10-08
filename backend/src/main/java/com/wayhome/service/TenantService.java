package com.wayhome.service;

import com.wayhome.dto.RentalHistoryResponse;
import com.wayhome.model.User;
import com.wayhome.repository.ApplicationRepository;
import com.wayhome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TenantService {
    private final UserRepository userRepository;
    private final AgreementService agreementService;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    public Map<String, Object> profileWithHistory(Long tenantId) {
        User user = userRepository.findById(tenantId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        RentalHistoryResponse history = agreementService.getRentalHistory(tenantId);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("user", user);
        out.put("rentalHistory", history);
        out.put("applications", applicationRepository.findByTenantId(tenantId));
        out.put("notifications", notificationService.listForUser(tenantId));
        return out;
    }
}
