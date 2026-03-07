package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ContactSubmissionDto;
import com.orbitos.portfolio.service.ContactSubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contact-submissions")
public class AdminContactController {

    private final ContactSubmissionService contactSubmissionService;

    public AdminContactController(ContactSubmissionService contactSubmissionService) {
        this.contactSubmissionService = contactSubmissionService;
    }

    @GetMapping
    public ResponseEntity<List<ContactSubmissionDto>> list() {
        return ResponseEntity.ok(contactSubmissionService.findAll());
    }
}
