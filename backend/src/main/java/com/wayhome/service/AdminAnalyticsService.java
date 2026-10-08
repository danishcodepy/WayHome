package com.wayhome.service;

import com.wayhome.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {
    private final UserRepository users;
    private final PropertyRepository properties;
    private final ApplicationRepository applications;
    private final AgreementRepository agreements;
    private final AuditLogRepository auditLogs;

    public Map<String,Object> overview() {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("totalUsers", users.count());
        m.put("activeUsers", users.findAll().stream().filter(u -> !"Blocked".equalsIgnoreCase(u.getStatus())).count());
        m.put("blockedUsers", users.findAll().stream().filter(u -> "Blocked".equalsIgnoreCase(u.getStatus())).count());
        m.put("admins", users.findAll().stream().filter(u -> "ADMIN".equals(u.getRole().name())).count());
        m.put("propertyManagers", users.findAll().stream().filter(u -> "PROPERTY_MANAGER".equals(u.getRole().name())).count());
        m.put("tenants", users.findAll().stream().filter(u -> "TENANT".equals(u.getRole().name()) || "STUDENT".equals(u.getRole().name())).count());
        m.put("totalProperties", properties.count());
        m.put("approvedProperties", properties.findByStatus("APPROVED").size());
        m.put("pendingProperties", properties.findByStatus("PENDING").size());
        m.put("rejectedProperties", properties.findByStatus("REJECTED").size());
        m.put("totalApplications", applications.count());
        m.put("pendingApplications", applications.findByStatus("Pending").size());
        m.put("approvedApplications", applications.findByStatus("Approved").size());
        m.put("rejectedApplications", applications.findByStatus("Rejected").size());
        m.put("totalAgreements", agreements.count());
        m.put("activeAgreements", agreements.findByStatus("Active").size());
        m.put("closedAgreements", agreements.findAll().stream().filter(a -> !"Active".equalsIgnoreCase(a.getStatus())).count());
        m.put("auditEvents", auditLogs.count());
        return m;
    }

    public Map<String,Object> manager(Long ownerId) {
        Map<String,Object> m = new LinkedHashMap<>();
        var props = properties.findByOwnerId(ownerId);
        var apps = applications.findAll().stream().filter(a -> a.getProperty()!=null && a.getProperty().getOwner()!=null && ownerId.equals(a.getProperty().getOwner().getId())).toList();
        var ag = agreements.findByOwnerId(ownerId);
        m.put("totalListings", props.size());
        m.put("approvedListings", props.stream().filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus())).count());
        m.put("pendingListings", props.stream().filter(p -> "PENDING".equalsIgnoreCase(p.getStatus())).count());
        m.put("rejectedListings", props.stream().filter(p -> "REJECTED".equalsIgnoreCase(p.getStatus())).count());
        m.put("totalApplications", apps.size());
        m.put("pendingApplications", apps.stream().filter(a -> "Pending".equalsIgnoreCase(a.getStatus())).count());
        m.put("approvedApplications", apps.stream().filter(a -> "Approved".equalsIgnoreCase(a.getStatus())).count());
        m.put("rejectedApplications", apps.stream().filter(a -> "Rejected".equalsIgnoreCase(a.getStatus())).count());
        m.put("totalAgreements", ag.size());
        m.put("activeAgreements", ag.stream().filter(a -> "Active".equalsIgnoreCase(a.getStatus())).count());
        m.put("monthlyRent", ag.stream().filter(a -> "Active".equalsIgnoreCase(a.getStatus())).mapToDouble(a -> a.getMonthlyRent()==null?0:a.getMonthlyRent()).sum());
        Map<Long,Integer> appsByProperty = new LinkedHashMap<>();
        for (var a : apps) appsByProperty.merge(a.getProperty().getId(), 1, Integer::sum);
        m.put("applicationsByProperty", appsByProperty);
        return m;
    }
}
