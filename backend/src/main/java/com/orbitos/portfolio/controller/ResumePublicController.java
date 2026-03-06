package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ResumeDto;
import com.orbitos.portfolio.service.domain.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/resume")
public class ResumePublicController {

    private final ResumeService resumeService;

    public ResumePublicController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping
    public ResponseEntity<ResumeDto> getResume() {
        return ResponseEntity.ok(resumeService.getResume());
    }
}
