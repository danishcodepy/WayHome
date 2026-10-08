package com.wayhome.service;

import com.wayhome.dto.RentalHistoryResponse;
import com.wayhome.exception.ForbiddenException;
import com.wayhome.model.Agreement;
import com.wayhome.model.Application;
import com.wayhome.model.Property;
import com.wayhome.model.User;
import com.wayhome.repository.AgreementRepository;
import com.wayhome.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgreementService {
    private final AgreementRepository agreementRepository;
    private final ApplicationRepository applicationRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public Agreement createFromApplication(Long applicationId, Long actorId, boolean admin) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));

        if (!"Approved".equalsIgnoreCase(application.getStatus())) {
            throw new IllegalArgumentException("Can only create agreement for approved applications");
        }

        Property property = application.getProperty();
        if (!admin && (property.getOwner() == null || !property.getOwner().getId().equals(actorId))) {
            throw new ForbiddenException("You can only create agreements for your own properties");
        }

        return agreementRepository.findByTenantId(application.getTenant().getId()).stream()
                .filter(a -> a.getApplication() != null && a.getApplication().getId().equals(application.getId()))
                .findFirst()
                .orElseGet(() -> persistNew(application, property, actorId));
    }

    private Agreement persistNew(Application application, Property property, Long actorId) {
        User tenant = application.getTenant();
        User owner = property.getOwner();
        Agreement agreement = Agreement.builder()
                .application(application)
                .property(property)
                .tenant(tenant)
                .owner(owner)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(12))
                .monthlyRent(property.getListingFor() != null && "buy".equalsIgnoreCase(property.getListingFor())
                        ? property.getSalePrice() : property.getRentMonthly())
                .status("Active")
                .build();
        Agreement saved = agreementRepository.save(agreement);
        auditLogService.log(actorId, "CREATE", "Agreement", saved.getId(),
                "Agreement created for property: " + property.getTitle() + ", tenant: " + tenant.getName());
        notificationService.create(tenant.getId(), "Rental Agreement Created",
                "A rental agreement for \"" + property.getTitle() + "\" is now available in your dashboard.");
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Agreement> listAll() { return agreementRepository.findAll(); }

    @Transactional(readOnly = true)
    public List<Agreement> listByTenant(Long tenantId) { return agreementRepository.findByTenantId(tenantId); }

    @Transactional(readOnly = true)
    public List<Agreement> listByOwner(Long ownerId) { return agreementRepository.findByOwnerId(ownerId); }

    @Transactional(readOnly = true)
    public Agreement getById(Long id) {
        return agreementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found: " + id));
    }

    @Transactional
    public Agreement updateStatus(Long id, String status, Long actorId, boolean admin) {
        if (!List.of("Active", "Completed", "Expired", "Terminated").contains(status)) {
            throw new IllegalArgumentException("Invalid agreement status");
        }
        Agreement agreement = getById(id);
        if (!admin && (agreement.getOwner() == null || !agreement.getOwner().getId().equals(actorId))) {
            throw new ForbiddenException("You can only update agreements for your own properties");
        }
        String previous = agreement.getStatus();
        agreement.setStatus(status);
        Agreement saved = agreementRepository.save(agreement);
        auditLogService.log(actorId, "UPDATE", "Agreement", id, "Agreement status changed from " + previous + " to " + status);
        if (agreement.getTenant() != null) {
            notificationService.create(agreement.getTenant().getId(), "Agreement updated",
                    "Your rental agreement for \"" + agreement.getProperty().getTitle() + "\" is now " + status + ".");
        }
        return saved;
    }

    @Transactional(readOnly = true)
    public RentalHistoryResponse getRentalHistory(Long tenantId) {
        List<Agreement> allAgreements = agreementRepository.findByTenantId(tenantId);
        List<Agreement> activeAgreements = allAgreements.stream()
                .filter(a -> "Active".equalsIgnoreCase(a.getStatus()))
                .collect(Collectors.toList());
        List<Agreement> pastAgreements = allAgreements.stream()
                .filter(a -> !"Active".equalsIgnoreCase(a.getStatus()))
                .collect(Collectors.toList());
        List<Application> applicationHistory = applicationRepository.findByTenantId(tenantId);

        return RentalHistoryResponse.builder()
                .activeAgreements(activeAgreements)
                .pastAgreements(pastAgreements)
                .applicationHistory(applicationHistory)
                .build();
    }
}
