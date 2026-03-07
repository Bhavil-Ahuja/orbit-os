package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ResumeDto;
import com.orbitos.portfolio.dto.UpdateAboutRequestDto;
import com.orbitos.portfolio.service.AboutService;
import com.orbitos.portfolio.service.domain.ResumeService;
import com.orbitos.portfolio.service.read.CacheEvictionService;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin")
public class AdminAboutController {

    private static final Logger log = LoggerFactory.getLogger(AdminAboutController.class);

    private final AboutService aboutService;
    private final CacheEvictionService cacheEvictionService;
    private final ResumeService resumeService;

    public AdminAboutController(AboutService aboutService, CacheEvictionService cacheEvictionService,
                                ResumeService resumeService) {
        this.aboutService = aboutService;
        this.cacheEvictionService = cacheEvictionService;
        this.resumeService = resumeService;
    }

    @PostConstruct
    public void logMappings() {
        log.info("AdminAboutController loaded: PATCH /api/admin/about, GET/POST /api/admin/upload-resume");
    }

    @GetMapping("/upload-resume")
    public ResponseEntity<String> uploadResumeGet() {
        return ResponseEntity.status(405).header(HttpHeaders.ALLOW, "POST").body("Use POST with multipart file");
    }

    @PatchMapping("/about")
    public ResponseEntity<Void> updateAbout(@Valid @RequestBody UpdateAboutRequestDto request) {
        aboutService.updateContent(request.getContent());
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-resume")
    public ResponseEntity<ResumeDto> uploadResume(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("POST /api/admin/upload-resume received, file: {} {} bytes", file.getOriginalFilename(), file.getSize());
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        ResumeDto dto = resumeService.uploadResumeFile(file);
        cacheEvictionService.evictResumeTerminal();
        cacheEvictionService.evictPortfolio();
        return ResponseEntity.ok(dto);
    }
}
