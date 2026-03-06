package com.orbitos.portfolio.service;

import com.orbitos.portfolio.dto.AboutDto;
import com.orbitos.portfolio.entity.About;
import com.orbitos.portfolio.mapper.AboutMapper;
import com.orbitos.portfolio.repository.AboutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AboutService {

    private final AboutRepository aboutRepository;
    private final AboutMapper aboutMapper;

    public AboutService(AboutRepository aboutRepository, AboutMapper aboutMapper) {
        this.aboutRepository = aboutRepository;
        this.aboutMapper = aboutMapper;
    }

    @Transactional(readOnly = true)
    public AboutDto getAbout() {
        About about = aboutRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultAbout);
        return aboutMapper.toDto(about);
    }

    /**
     * Self-healing: ensure singleton row exists. Runs in its own transaction so insert commits.
     */
    @Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW)
    public About createDefaultAbout() {
        About defaultAbout = About.builder()
                .content("")
                .updatedAt(Instant.now())
                .build();
        return aboutRepository.save(defaultAbout);
    }

    @Transactional
    public void updateContent(String content) {
        About about = aboutRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultAbout);
        aboutRepository.updateContent(about.getId(), content, Instant.now());
    }
}
