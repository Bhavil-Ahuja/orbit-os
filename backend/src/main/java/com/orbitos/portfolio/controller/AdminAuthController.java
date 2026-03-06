package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.LoginRequestDto;
import com.orbitos.portfolio.dto.LoginResponseDto;
import com.orbitos.portfolio.security.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        String token = adminAuthService.login(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(new LoginResponseDto(token));
    }
}
