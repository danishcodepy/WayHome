package com.wayhome.repository;

import com.wayhome.model.University;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UniversityRepository extends JpaRepository<University, Long> {
    List<University> findByStateContainingIgnoreCase(String state);
    List<University> findByCityContainingIgnoreCase(String city);
}
