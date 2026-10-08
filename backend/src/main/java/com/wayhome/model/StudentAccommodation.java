package com.wayhome.model;

import jakarta.persistence.*;
import lombok.*;

/** Student accommodation (hostel / PG / flat) near a university. */
@Entity
@Table(name = "student_accommodation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentAccommodation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    /** HOSTEL | PG | FLAT */
    private String type;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "university_id")
    private University university;

    private Double distanceKm;
    private Double rentMonthly;
    private String roomType;
    private String furnishing;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private String description;
    private Double rating;
    private Integer reviewCount;
    private Integer availableRooms;
    @Builder.Default private Boolean wifi = false;
    @Builder.Default private Boolean food = false;
    @Builder.Default private Boolean laundry = false;
    @Builder.Default private Boolean security = false;

    private String ownerName;
    private String ownerPhone;
}
