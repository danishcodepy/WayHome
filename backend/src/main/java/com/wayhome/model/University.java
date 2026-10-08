package com.wayhome.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/** University / college used by the student accommodation finder. */
@Entity
@Table(name = "university")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class University {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private String city;

    private String state;
    private Double latitude;
    private Double longitude;
}
