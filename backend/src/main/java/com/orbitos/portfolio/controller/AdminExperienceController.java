package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.CreateExperienceRequestDto;
import com.orbitos.portfolio.dto.ExperienceDto;
import com.orbitos.portfolio.dto.UpdateExperienceRequestDto;
import com.orbitos.portfolio.service.ExperienceService;
import com.orbitos.portfolio.service.read.CacheEvictionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/experience")
public class AdminExperienceController {

    private final ExperienceService experienceService;
    private final CacheEvictionService cacheEvictionService;

    public AdminExperienceController(ExperienceService experienceService, CacheEvictionService cacheEvictionService) {
        this.experienceService = experienceService;
        this.cacheEvictionService = cacheEvictionService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> create(@Valid @RequestBody CreateExperienceRequestDto request) {
        Long id = experienceService.createExperience(request);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ExperienceDto> update(@PathVariable Long id,
                                                @Valid @RequestBody UpdateExperienceRequestDto request) {
        ExperienceDto dto = experienceService.updateExperience(id, request);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        experienceService.deleteExperience(id);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> orderedIds) {
        experienceService.reorder(orderedIds);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.noContent().build();
    }
}
