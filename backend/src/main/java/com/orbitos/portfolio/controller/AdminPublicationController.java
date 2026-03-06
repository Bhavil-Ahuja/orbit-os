package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.CreatePublicationRequestDto;
import com.orbitos.portfolio.dto.PublicationDto;
import com.orbitos.portfolio.dto.UpdatePublicationRequestDto;
import com.orbitos.portfolio.service.PublicationService;
import com.orbitos.portfolio.service.read.CacheEvictionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/publications")
public class AdminPublicationController {

    private final PublicationService publicationService;
    private final CacheEvictionService cacheEvictionService;

    public AdminPublicationController(PublicationService publicationService, CacheEvictionService cacheEvictionService) {
        this.publicationService = publicationService;
        this.cacheEvictionService = cacheEvictionService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> create(@Valid @RequestBody CreatePublicationRequestDto request) {
        Long id = publicationService.createPublication(request);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PublicationDto> update(@PathVariable Long id,
                                                 @Valid @RequestBody UpdatePublicationRequestDto request) {
        PublicationDto dto = publicationService.updatePublication(id, request);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        publicationService.deletePublication(id);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.noContent().build();
    }
}
