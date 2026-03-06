package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.WhoAmIDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminWhoAmIController {

    @GetMapping("/whoami")
    public ResponseEntity<WhoAmIDto> whoami() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(new WhoAmIDto(username));
    }
}
