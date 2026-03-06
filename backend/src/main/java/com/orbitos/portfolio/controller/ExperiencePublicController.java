package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ExperienceDto;
import com.orbitos.portfolio.service.ExperienceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/experience")
public class ExperiencePublicController {

    private final ExperienceService experienceService;

    public ExperiencePublicController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @GetMapping
    public ResponseEntity<List<ExperienceDto>> list() {
        return ResponseEntity.ok(experienceService.findAll());
    }
}
