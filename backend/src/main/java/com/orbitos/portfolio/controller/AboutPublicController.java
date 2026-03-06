package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.AboutDto;
import com.orbitos.portfolio.service.AboutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/about")
public class AboutPublicController {

    private final AboutService aboutService;

    public AboutPublicController(AboutService aboutService) {
        this.aboutService = aboutService;
    }

    @GetMapping
    public ResponseEntity<AboutDto> getAbout() {
        return ResponseEntity.ok(aboutService.getAbout());
    }
}
