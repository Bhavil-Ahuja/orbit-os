package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.CreateProjectRequestDto;
import com.orbitos.portfolio.dto.ProjectDto;
import com.orbitos.portfolio.dto.UpdateProjectRequestDto;
import com.orbitos.portfolio.service.domain.ProjectService;
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
@RequestMapping("/api/admin/projects")
public class AdminProjectController {

    private final ProjectService projectService;
    private final CacheEvictionService cacheEvictionService;

    public AdminProjectController(ProjectService projectService, CacheEvictionService cacheEvictionService) {
        this.projectService = projectService;
        this.cacheEvictionService = cacheEvictionService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> createProject(@Valid @RequestBody CreateProjectRequestDto request) {
        Long id = projectService.createProject(request);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id,
                                                     @Valid @RequestBody UpdateProjectRequestDto request) {
        ProjectDto dto = projectService.updateProject(id, request);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ProjectDto> publishProject(@PathVariable Long id) {
        ProjectDto dto = projectService.publishProject(id);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> orderedIds) {
        projectService.reorder(orderedIds);
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.noContent().build();
    }
}
