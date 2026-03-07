package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.BootstrapDto;
import com.orbitos.portfolio.service.read.BootstrapReadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class HealthController {

    private final BootstrapReadService bootstrapReadService;

    public HealthController(BootstrapReadService bootstrapReadService) {
        this.bootstrapReadService = bootstrapReadService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "portfolio"));
    }

    /** Use this to confirm the running app has the latest code. Returns 200 with version. */
    @GetMapping("/version")
    public ResponseEntity<Map<String, String>> version() {
        return ResponseEntity.ok(Map.of("version", "bootstrap-v1", "endpoint", "/api/public/bootstrap"));
    }

    @GetMapping("/bootstrap")
    public ResponseEntity<BootstrapDto> getBootstrap() {
        return ResponseEntity.ok(bootstrapReadService.getBootstrap());
    }
}
