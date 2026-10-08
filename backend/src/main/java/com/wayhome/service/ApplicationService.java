package com.wayhome.service;

import com.wayhome.exception.ForbiddenException;
import com.wayhome.model.Agreement;
import com.wayhome.model.Application;
import com.wayhome.model.Property;
import com.wayhome.model.User;
import com.wayhome.repository.AgreementRepository;
import com.wayhome.repository.ApplicationRepository;
import com.wayhome.repository.PropertyRepository;
import com.wayhome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final AgreementRepository agreementRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public Application apply(Long propertyId, Long tenantId, String phone, String message, LocalDate moveInDate) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + propertyId));
        User tenant = userRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));
        if (!"APPROVED".equalsIgnoreCase(property.getStatus())) {
            throw new IllegalArgumentException("This property is not currently available for applications");
        }
        if (applicationRepository.findByTenantId(tenantId).stream().anyMatch(a ->
                a.getProperty().getId().equals(propertyId) && !"Rejected".equalsIgnoreCase(a.getStatus()))) {
            throw new IllegalArgumentException("You already have an active application for this property");
        }
        Application saved = applicationRepository.save(Application.builder()
                .property(property)
                .tenant(tenant)
                .status("Pending")
                .applicantPhone(phone)
                .message(message)
                .moveInDate(moveInDate)
                .build());
        auditLogService.log(tenantId, "CREATE", "Application", saved.getId(), "Application submitted for property: " + property.getTitle());
        notificationService.create(tenantId, "Application submitted",
                "Your application for \"" + property.getTitle() + "\" was submitted and is awaiting review.");
        if (property.getOwner() != null) {
            notificationService.create(property.getOwner().getId(), "New rental application",
                    tenant.getName() + " applied for \"" + property.getTitle() + "\".");
        }
        return saved;
    }

    public Application apply(Long propertyId, Long tenantId) {
        return apply(propertyId, tenantId, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<Application> listAll() { return applicationRepository.findAll(); }

    @Transactional(readOnly = true)
    public List<Application> listByTenant(Long tenantId) { return applicationRepository.findByTenantId(tenantId); }

    @Transactional(readOnly = true)
    public List<Application> listByProperty(Long propertyId) { return applicationRepository.findByPropertyId(propertyId); }

    @Transactional(readOnly = true)
    public List<Application> listByOwner(Long ownerId) {
        return applicationRepository.findAll().stream()
                .filter(a -> a.getProperty() != null && a.getProperty().getOwner() != null && ownerId.equals(a.getProperty().getOwner().getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Application getById(Long id) {
        return applicationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));
    }

    @Transactional
    public Application updateStatus(Long id, String status, Long actorId, boolean admin) {
        if (!List.of("Pending", "Approved", "Rejected").contains(status)) {
            throw new IllegalArgumentException("Invalid application status");
        }
        Application application = getById(id);
        Property property = application.getProperty();
        if (!admin && (property.getOwner() == null || !property.getOwner().getId().equals(actorId))) {
            throw new ForbiddenException("You can only update applications for your own listings");
        }
        String previous = application.getStatus();
        application.setStatus(status);
        applicationRepository.save(application);
        auditLogService.log(actorId, "UPDATE_STATUS", "Application", id,
                "Application status changed from " + previous + " to " + status + " for property: " + property.getTitle());

        if ("Approved".equalsIgnoreCase(status) && !"Approved".equalsIgnoreCase(previous)) {
            ensureAgreement(application, property, actorId);
            notificationService.create(application.getTenant().getId(), "Application Approved",
                    "Your application for \"" + property.getTitle() + "\" was approved. A rental agreement has been created.");
        } else if ("Rejected".equalsIgnoreCase(status) && !"Rejected".equalsIgnoreCase(previous)) {
            notificationService.create(application.getTenant().getId(), "Application Rejected",
                    "Your application for \"" + property.getTitle() + "\" was rejected.");
        } else if (!status.equalsIgnoreCase(previous)) {
            notificationService.create(application.getTenant().getId(), "Application status updated",
                    "Your application for \"" + property.getTitle() + "\" is now " + status + ".");
        }
        return application;
    }

    private void ensureAgreement(Application application, Property property, Long actorId) {
        boolean exists = agreementRepository.findByTenantId(application.getTenant().getId()).stream()
                .anyMatch(a -> a.getApplication() != null && a.getApplication().getId().equals(application.getId()));
        if (exists) return;
        Agreement saved = agreementRepository.save(Agreement.builder()
                .application(application)
                .property(property)
                .tenant(application.getTenant())
                .owner(property.getOwner())
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(12))
                .monthlyRent(property.getListingFor() != null && "buy".equalsIgnoreCase(property.getListingFor())
                        ? property.getSalePrice() : property.getRentMonthly())
                .status("Active")
                .build());
        auditLogService.log(actorId, "CREATE", "Agreement", saved.getId(),
                "Agreement created for property: " + property.getTitle() + ", tenant: " + application.getTenant().getName());
        notificationService.create(application.getTenant().getId(), "Rental Agreement Created",
                "A rental agreement for \"" + property.getTitle() + "\" is now available in your dashboard.");
    }
}
