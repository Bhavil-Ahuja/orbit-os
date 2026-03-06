package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.PublicationDto;
import com.orbitos.portfolio.service.PublicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/publications")
public class PublicationPublicController {

    private final PublicationService publicationService;

    public PublicationPublicController(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    @GetMapping
    public ResponseEntity<List<PublicationDto>> list() {
        return ResponseEntity.ok(publicationService.findAll());
    }
}
