package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.PortfolioDto;
import com.orbitos.portfolio.service.read.PortfolioReadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/portfolio")
public class PortfolioReadController {

    private final PortfolioReadService portfolioReadService;

    public PortfolioReadController(PortfolioReadService portfolioReadService) {
        this.portfolioReadService = portfolioReadService;
    }

    @GetMapping
    public ResponseEntity<PortfolioDto> getPortfolio() {
        return ResponseEntity.ok(portfolioReadService.getPortfolio());
    }
}
