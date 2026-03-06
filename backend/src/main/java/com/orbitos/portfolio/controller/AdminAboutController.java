package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.UpdateAboutRequestDto;
import com.orbitos.portfolio.service.AboutService;
import com.orbitos.portfolio.service.read.CacheEvictionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminAboutController {

    private final AboutService aboutService;
    private final CacheEvictionService cacheEvictionService;

    public AdminAboutController(AboutService aboutService, CacheEvictionService cacheEvictionService) {
        this.aboutService = aboutService;
        this.cacheEvictionService = cacheEvictionService;
    }

    @PatchMapping("/about")
    public ResponseEntity<Void> updateAbout(@Valid @RequestBody UpdateAboutRequestDto request) {
        aboutService.updateContent(request.getContent());
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.noContent().build();
    }
}
