package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.NavigationDto;
import com.orbitos.portfolio.service.read.NavigationReadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/navigation")
public class NavigationReadController {

    private final NavigationReadService navigationReadService;

    public NavigationReadController(NavigationReadService navigationReadService) {
        this.navigationReadService = navigationReadService;
    }

    @GetMapping
    public ResponseEntity<NavigationDto> getNavigation() {
        return ResponseEntity.ok(navigationReadService.getNavigation());
    }
}
