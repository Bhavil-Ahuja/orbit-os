package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.SystemCategoryDto;
import com.orbitos.portfolio.service.SystemCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/systems")
public class SystemCategoryPublicController {

    private final SystemCategoryService systemCategoryService;

    public SystemCategoryPublicController(SystemCategoryService systemCategoryService) {
        this.systemCategoryService = systemCategoryService;
    }

    @GetMapping
    public ResponseEntity<List<SystemCategoryDto>> list() {
        return ResponseEntity.ok(systemCategoryService.findAll());
    }
}
