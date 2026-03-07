package com.orbitos.portfolio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.event.EventListener;

@SpringBootApplication
@EnableCaching
public class PortfolioApplication {

    private static final Logger log = LoggerFactory.getLogger(PortfolioApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(PortfolioApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        log.info("Public API: GET /api/public/health, GET /api/public/bootstrap, GET /api/public/version");
        log.info("Admin resume upload: POST /api/admin/upload-resume (auth required)");
    }
}
