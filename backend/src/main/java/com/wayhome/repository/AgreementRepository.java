package com.wayhome.repository;

import com.wayhome.model.Agreement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgreementRepository extends JpaRepository<Agreement, Long> {
    List<Agreement> findByTenantId(Long tenantId);
    List<Agreement> findByOwnerId(Long ownerId);
    List<Agreement> findByStatus(String status);
}
