package com.wayhome.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Rental application submitted by a tenant for a property. */
@Entity
@Table(name = "application")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;

    /** Pending | Approved | Rejected */
    @Builder.Default
    private String status = "Pending";

    private String applicantPhone;

    @Column(length = 2000)
    private String message;

    private LocalDate moveInDate;

    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();
}
