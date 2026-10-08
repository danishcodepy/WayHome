package com.wayhome.service;

import com.wayhome.exception.ForbiddenException;
import com.wayhome.model.Property;
import com.wayhome.model.User;
import com.wayhome.repository.PropertyRepository;
import com.wayhome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/** Property listing lifecycle: submit -> approve/reject -> search. */
@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public Property submit(Property property, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found: " + ownerId));
        property.setId(null);
        property.setOwner(owner);
        property.setStatus("PENDING");
        property.setVerified(false);
        if (property.getListingFor() == null || property.getListingFor().isBlank()) property.setListingFor("rent");
        if (property.getFacilities() == null) property.setFacilities(new java.util.LinkedHashSet<>());
        if (property.getCustomFields() == null) property.setCustomFields(new java.util.LinkedHashMap<>());
        Property saved = propertyRepository.save(property);
        auditLogService.log(ownerId, "CREATE", "Property", saved.getId(), "Property submitted for approval: " + saved.getTitle());
        return saved;
    }

    @Transactional
    public Property approve(Long id, Long actorId) {
        Property property = getById(id);
        property.setStatus("APPROVED");
        property.setVerified(true);
        property.setRejectionReason(null);
        Property saved = propertyRepository.save(property);
        auditLogService.log(actorId, "APPROVE", "Property", saved.getId(), "Property approved: " + saved.getTitle());
        if (saved.getOwner() != null) {
            // owner is notified via NotificationService from controller/service later if wired; keep audit here
        }
        return saved;
    }

    public Property approve(Long id) {
        return approve(id, null);
    }

    @Transactional
    public Property reject(Long id, String reason, Long actorId) {
        Property property = getById(id);
        property.setStatus("REJECTED");
        property.setVerified(false);
        property.setRejectionReason(reason == null ? "" : reason.trim());
        Property saved = propertyRepository.save(property);
        auditLogService.log(actorId, "REJECT", "Property", saved.getId(), "Property rejected: " + saved.getTitle());
        return saved;
    }

    @Transactional(readOnly = true)
    public Property getById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Property> listAllApproved() {
        return propertyRepository.findByStatus("APPROVED");
    }

    @Transactional(readOnly = true)
    public List<Property> listAll() {
        return propertyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Property> listByOwner(Long ownerId) {
        return propertyRepository.findByOwnerId(ownerId);
    }

    @Transactional(readOnly = true)
    public List<Property> search(String city, String type, Double maxRent) {
        return search(city, null, type, null, maxRent, null, null, "rent", null);
    }

    @Transactional(readOnly = true)
    public List<Property> search(String city, String location, String type, Double minRent, Double maxRent,
                                 Integer bedrooms, String furnishing, String listingFor, String amenities) {
        String query = firstNonBlank(location, city);
        List<String> types = type == null || type.isBlank() ? List.of() :
                Arrays.stream(type.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList();
        List<String> facilityFilters = amenities == null || amenities.isBlank() ? List.of() :
                Arrays.stream(amenities.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList();
        return propertyRepository.findAll().stream()
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus()))
                .filter(p -> listingFor == null || listingFor.isBlank()
                        || listingFor.equalsIgnoreCase(p.getListingFor() == null ? "rent" : p.getListingFor()))
                .filter(p -> query == null || query.isBlank() || containsIgnoreCase(p.getCity(), query)
                        || containsIgnoreCase(p.getLocation(), query) || containsIgnoreCase(p.getTitle(), query)
                        || containsIgnoreCase(p.getState(), query) || containsIgnoreCase(p.getPin(), query))
                .filter(p -> types.isEmpty() || types.stream().anyMatch(t -> t.equalsIgnoreCase(p.getType())))
                .filter(p -> minRent == null || (price(p) != null && price(p) >= minRent))
                .filter(p -> maxRent == null || (price(p) != null && price(p) <= maxRent))
                .filter(p -> bedrooms == null || bedrooms <= 0 || (p.getBedrooms() != null
                        && (bedrooms >= 4 ? p.getBedrooms() >= 4 : p.getBedrooms().equals(bedrooms))))
                .filter(p -> furnishing == null || furnishing.isBlank() || furnishing.equalsIgnoreCase(p.getFurnishing()))
                .filter(p -> facilityFilters.isEmpty() || (p.getFacilities() != null && facilityFilters.stream()
                        .allMatch(f -> p.getFacilities().stream().anyMatch(existing -> existing.toLowerCase(Locale.ROOT).contains(f.toLowerCase(Locale.ROOT))))))
                .collect(Collectors.toList());
    }

    @Transactional
    public Property update(Long id, Property changes, Long actorId, boolean admin) {
        Property property = getById(id);
        if (!admin && (property.getOwner() == null || !property.getOwner().getId().equals(actorId))) {
            throw new ForbiddenException("You can only edit your own listings");
        }
        if (changes.getTitle() != null) property.setTitle(changes.getTitle());
        if (changes.getType() != null) property.setType(changes.getType());
        if (changes.getCity() != null) property.setCity(changes.getCity());
        if (changes.getState() != null) property.setState(changes.getState());
        if (changes.getPin() != null) property.setPin(changes.getPin());
        if (changes.getLocation() != null) property.setLocation(changes.getLocation());
        if (changes.getRentMonthly() != null) property.setRentMonthly(changes.getRentMonthly());
        if (changes.getSalePrice() != null) property.setSalePrice(changes.getSalePrice());
        if (changes.getListingFor() != null) property.setListingFor(changes.getListingFor());
        if (changes.getBedrooms() != null) property.setBedrooms(changes.getBedrooms());
        if (changes.getBathrooms() != null) property.setBathrooms(changes.getBathrooms());
        if (changes.getAreaSqft() != null) property.setAreaSqft(changes.getAreaSqft());
        if (changes.getFurnishing() != null) property.setFurnishing(changes.getFurnishing());
        if (changes.getDeposit() != null) property.setDeposit(changes.getDeposit());
        if (changes.getMaintenance() != null) property.setMaintenance(changes.getMaintenance());
        if (changes.getImageUrl() != null) property.setImageUrl(changes.getImageUrl());
        if (changes.getLatitude() != null) property.setLatitude(changes.getLatitude());
        if (changes.getLongitude() != null) property.setLongitude(changes.getLongitude());
        if (changes.getDescription() != null) property.setDescription(changes.getDescription());
        if (changes.getRejectionReason() != null) property.setRejectionReason(changes.getRejectionReason());
        if (changes.getFacilities() != null) property.setFacilities(changes.getFacilities());
        if (changes.getCustomFields() != null) property.setCustomFields(changes.getCustomFields());
        Property saved = propertyRepository.save(property);
        auditLogService.log(actorId, "UPDATE", "Property", saved.getId(), "Property updated: " + saved.getTitle());
        return saved;
    }

    @Transactional
    public void delete(Long id, Long actorId, boolean admin) {
        Property property = getById(id);
        if (!admin && (property.getOwner() == null || !property.getOwner().getId().equals(actorId))) {
            throw new ForbiddenException("You can only delete your own listings");
        }
        String title = property.getTitle();
        propertyRepository.delete(property);
        auditLogService.log(actorId, "DELETE", "Property", id, "Property deleted: " + title);
    }

    private Double price(Property property) {
        if (property.getListingFor() != null && "buy".equalsIgnoreCase(property.getListingFor())) return property.getSalePrice();
        return property.getRentMonthly();
    }

    private boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query.toLowerCase(Locale.ROOT));
    }

    private String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }
}
