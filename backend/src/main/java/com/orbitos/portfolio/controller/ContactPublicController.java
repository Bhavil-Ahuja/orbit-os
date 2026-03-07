package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ContactSubmissionRequestDto;
import com.orbitos.portfolio.service.ContactSubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/contact")
public class ContactPublicController {

    private final ContactSubmissionService contactSubmissionService;

    public ContactPublicController(ContactSubmissionService contactSubmissionService) {
        this.contactSubmissionService = contactSubmissionService;
    }

    @PostMapping
    public ResponseEntity<Void> submit(@Valid @RequestBody ContactSubmissionRequestDto request) {
        contactSubmissionService.submit(request);
        return ResponseEntity.noContent().build();
    }
}
