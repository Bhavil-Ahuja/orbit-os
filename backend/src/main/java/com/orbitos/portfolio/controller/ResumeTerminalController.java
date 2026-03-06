package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ResumeTerminalDto;
import com.orbitos.portfolio.service.read.ResumeTerminalReadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/resume")
public class ResumeTerminalController {

    private final ResumeTerminalReadService resumeTerminalReadService;

    public ResumeTerminalController(ResumeTerminalReadService resumeTerminalReadService) {
        this.resumeTerminalReadService = resumeTerminalReadService;
    }

    @GetMapping("/terminal")
    public ResponseEntity<ResumeTerminalDto> getResumeTerminal() {
        return ResponseEntity.ok(resumeTerminalReadService.getResumeTerminal());
    }
}
