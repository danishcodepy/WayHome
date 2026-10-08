package com.wayhome.service;

import com.wayhome.model.StudentAccommodation;
import com.wayhome.model.University;
import com.wayhome.repository.StudentAccommodationRepository;
import com.wayhome.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/** Student accommodation listing and finder search. */
@Service
@RequiredArgsConstructor
public class AccommodationService {

    private final StudentAccommodationRepository accommodationRepository;
    private final UniversityRepository universityRepository;

    /** Adds an accommodation; links to university when universityId is supplied. */
    public StudentAccommodation add(StudentAccommodation accommodation, Long universityId) {
        accommodation.setId(null);
        if (universityId != null) {
            University university = universityRepository.findById(universityId)
                    .orElseThrow(() -> new IllegalArgumentException("University not found: " + universityId));
            accommodation.setUniversity(university);
        }
        return accommodationRepository.save(accommodation);
    }

    public List<StudentAccommodation> listAll() {
        return accommodationRepository.findAll();
    }

    /** Finder search by university, accommodation type and max monthly rent. */
    public List<StudentAccommodation> search(Long universityId, String type, Double maxRent) {
        List<StudentAccommodation> results;
        if (universityId != null && type != null && !type.isBlank()) {
            results = accommodationRepository.findByUniversityIdAndType(universityId, type.toUpperCase());
        } else if (universityId != null) {
            results = accommodationRepository.findByUniversityId(universityId);
        } else if (type != null && !type.isBlank()) {
            results = accommodationRepository.findByType(type.toUpperCase());
        } else {
            results = accommodationRepository.findAll();
        }
        return results.stream()
                .filter(a -> maxRent == null || (a.getRentMonthly() != null && a.getRentMonthly() <= maxRent))
                .collect(Collectors.toList());
    }

    public StudentAccommodation getById(Long id) {
        return accommodationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Accommodation not found: " + id));
    }

    public List<University> listUniversities() {
        return universityRepository.findAll();
    }
}
