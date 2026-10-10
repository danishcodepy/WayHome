package com.wayhome.model;

import jakarta.persistence.*;
import lombok.*;

/** Image attached to a property listing. */
@Entity
@Table(name = "property_image")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;
}
