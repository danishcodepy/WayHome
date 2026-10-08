package com.wayhome.controller;

import com.wayhome.model.StudentAccommodation;
import com.wayhome.service.AccommodationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accommodations")
@RequiredArgsConstructor
public class AccommodationController {
    private final AccommodationService accommodationService;

    @GetMapping
    public ResponseEntity<List<StudentAccommodation>> search(@RequestParam(required = false) Long universityId,
                                                             @RequestParam(required = false) String type,
                                                             @RequestParam(required = false) Double maxRent) {
        return ResponseEntity.ok(accommodationService.search(universityId, type, maxRent));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try { return ResponseEntity.ok(accommodationService.getById(id)); }
        catch (IllegalArgumentException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody StudentAccommodation accommodation,
                                 @RequestParam(required = false) Long universityId) {
        try { return ResponseEntity.status(HttpStatus.CREATED).body(accommodationService.add(accommodation, universityId)); }
        catch (IllegalArgumentException e) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage()); }
    }

    @GetMapping("/universities")
    public ResponseEntity<?> universities() { return ResponseEntity.ok(accommodationService.listUniversities()); }
}
