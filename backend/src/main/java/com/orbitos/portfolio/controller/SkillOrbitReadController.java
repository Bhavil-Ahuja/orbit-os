package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.CategoryOrbitDto;
import com.orbitos.portfolio.service.read.SkillOrbitReadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/skills")
public class SkillOrbitReadController {

    private final SkillOrbitReadService skillOrbitReadService;

    public SkillOrbitReadController(SkillOrbitReadService skillOrbitReadService) {
        this.skillOrbitReadService = skillOrbitReadService;
    }

    @GetMapping("/orbits")
    public ResponseEntity<List<CategoryOrbitDto>> getSkillsOrbits() {
        return ResponseEntity.ok(skillOrbitReadService.getSkillsByOrbit());
    }
}
