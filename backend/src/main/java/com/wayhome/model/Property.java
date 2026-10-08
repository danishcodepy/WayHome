package com.wayhome.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/** Rental/sale property listed by a property manager. */
@Entity
@Table(name = "property")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    /** e.g. Apartment, House, Villa, Office, Shop */
    private String type;

    private String city;
    private String state;
    private String pin;

    /** Street address / locality */
    private String location;

    private Double rentMonthly;
    private Double salePrice;
    private String listingFor;
    private Integer bedrooms;
    private Integer bathrooms;
    private Double areaSqft;
    private String furnishing;
    private Double deposit;
    private Double maintenance;
    private String imageUrl;
    private Double latitude;
    private Double longitude;

    @Lob
    private String description;

    /** PENDING | APPROVED | REJECTED */
    @Builder.Default
    private String status = "PENDING";

    @Builder.Default
    private Boolean verified = false;

    @Column(length = 1000)
    private String rejectionReason;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "property_facility", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "facility")
    @Builder.Default
    private Set<String> facilities = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "property_custom_field", joinColumns = @JoinColumn(name = "property_id"))
    @MapKeyColumn(name = "field_name")
    @Column(name = "field_value", length = 1000)
    @Builder.Default
    private Map<String, String> customFields = new LinkedHashMap<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User owner;
}
