package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.CreateSkillRequestDto;
import com.orbitos.portfolio.dto.SkillDto;
import com.orbitos.portfolio.dto.UpdateSkillRequestDto;
import com.orbitos.portfolio.service.SkillService;
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
@RequestMapping("/api/admin/skills")
public class AdminSkillController {

    private final SkillService skillService;
    private final CacheEvictionService cacheEvictionService;

    public AdminSkillController(SkillService skillService, CacheEvictionService cacheEvictionService) {
        this.skillService = skillService;
        this.cacheEvictionService = cacheEvictionService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> create(@Valid @RequestBody CreateSkillRequestDto request) {
        Long id = skillService.createSkill(request);
        cacheEvictionService.evictPortfolio();
        cacheEvictionService.evictSkillOrbits();
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SkillDto> update(@PathVariable Long id, @Valid @RequestBody UpdateSkillRequestDto request) {
        SkillDto dto = skillService.updateSkill(id, request);
        cacheEvictionService.evictPortfolio();
        cacheEvictionService.evictSkillOrbits();
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        skillService.deleteSkill(id);
        cacheEvictionService.evictPortfolio();
        cacheEvictionService.evictSkillOrbits();
        return ResponseEntity.noContent().build();
    }
}
