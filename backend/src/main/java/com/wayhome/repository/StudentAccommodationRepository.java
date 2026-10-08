package com.wayhome.repository;

import com.wayhome.model.StudentAccommodation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentAccommodationRepository extends JpaRepository<StudentAccommodation, Long> {
    List<StudentAccommodation> findByUniversityId(Long universityId);
    List<StudentAccommodation> findByType(String type);
    List<StudentAccommodation> findByUniversityIdAndType(Long universityId, String type);
}
