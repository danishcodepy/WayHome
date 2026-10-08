package com.wayhome.repository;

import com.wayhome.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByTenantId(Long tenantId);
    List<Application> findByPropertyId(Long propertyId);
    List<Application> findByStatus(String status);
}
