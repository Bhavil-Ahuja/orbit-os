package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.CreateSystemCategoryRequestDto;
import com.orbitos.portfolio.dto.SystemCategoryDto;
import com.orbitos.portfolio.dto.UpdateSystemCategoryRequestDto;
import com.orbitos.portfolio.service.SystemCategoryService;
import com.orbitos.portfolio.service.read.CacheEvictionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/systems")
public class AdminSystemCategoryController {

    private final SystemCategoryService systemCategoryService;
    private final CacheEvictionService cacheEvictionService;

    public AdminSystemCategoryController(SystemCategoryService systemCategoryService,
                                         CacheEvictionService cacheEvictionService) {
        this.systemCategoryService = systemCategoryService;
        this.cacheEvictionService = cacheEvictionService;
    }

    @GetMapping
    public ResponseEntity<List<SystemCategoryDto>> list() {
        return ResponseEntity.ok(systemCategoryService.findAll());
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> create(@Valid @RequestBody CreateSystemCategoryRequestDto request) {
        Long id = systemCategoryService.create(request);
        cacheEvictionService.evictSystems();
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SystemCategoryDto> update(@PathVariable("id") Long id,
                                                    @Valid @RequestBody UpdateSystemCategoryRequestDto request) {
        SystemCategoryDto dto = systemCategoryService.update(id, request);
        cacheEvictionService.evictSystems();
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        systemCategoryService.delete(id);
        cacheEvictionService.evictSystems();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> orderedIds) {
        systemCategoryService.reorder(orderedIds);
        cacheEvictionService.evictSystems();
        return ResponseEntity.noContent().build();
    }
}
