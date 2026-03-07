package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.SkillCategoryDto;
import com.orbitos.portfolio.dto.SkillDto;
import com.orbitos.portfolio.service.SkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/skills")
public class SkillPublicController {

    private final SkillService skillService;

    public SkillPublicController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<List<SkillDto>> list() {
        return ResponseEntity.ok(skillService.findAll());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<SkillCategoryDto>> listCategories() {
        return ResponseEntity.ok(skillService.findAllCategories());
    }
}
