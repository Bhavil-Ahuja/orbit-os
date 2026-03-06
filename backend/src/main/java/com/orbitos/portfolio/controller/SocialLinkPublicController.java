package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.SocialLinkDto;
import com.orbitos.portfolio.service.SocialLinkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/social-links")
public class SocialLinkPublicController {

    private final SocialLinkService socialLinkService;

    public SocialLinkPublicController(SocialLinkService socialLinkService) {
        this.socialLinkService = socialLinkService;
    }

    @GetMapping
    public ResponseEntity<List<SocialLinkDto>> list() {
        return ResponseEntity.ok(socialLinkService.findAll());
    }
}
