package com.wayhome.repository;

import com.wayhome.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByStatus(String status);
    List<Property> findByCityContainingIgnoreCase(String city);
    List<Property> findByOwnerId(Long ownerId);
    List<Property> findByCityContainingIgnoreCaseAndTypeContainingIgnoreCase(String city, String type);
}
