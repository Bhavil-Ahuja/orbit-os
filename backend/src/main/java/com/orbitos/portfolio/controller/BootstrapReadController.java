package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.BootstrapDto;
import com.orbitos.portfolio.service.read.BootstrapReadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class BootstrapReadController {

    private final BootstrapReadService bootstrapReadService;

    public BootstrapReadController(BootstrapReadService bootstrapReadService) {
        this.bootstrapReadService = bootstrapReadService;
    }

    @GetMapping("/bootstrap")
    public ResponseEntity<BootstrapDto> getBootstrap() {
        return ResponseEntity.ok(bootstrapReadService.getBootstrap());
    }
}
