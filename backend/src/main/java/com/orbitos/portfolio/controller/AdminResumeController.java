package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ResumeDto;
import com.orbitos.portfolio.dto.UpdateResumeRequestDto;
import com.orbitos.portfolio.service.domain.ResumeService;
import com.orbitos.portfolio.service.read.CacheEvictionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/resume")
public class AdminResumeController {

    private final ResumeService resumeService;
    private final CacheEvictionService cacheEvictionService;

    public AdminResumeController(ResumeService resumeService, CacheEvictionService cacheEvictionService) {
        this.resumeService = resumeService;
        this.cacheEvictionService = cacheEvictionService;
    }

    @PatchMapping
    public ResponseEntity<ResumeDto> updateResume(@Valid @RequestBody UpdateResumeRequestDto request) {
        ResumeDto dto = resumeService.updateResume(request);
        cacheEvictionService.evictResumeTerminal();
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.ok(dto);
    }
}
