package com.orbitos.portfolio.service;

import com.orbitos.portfolio.dto.AboutDto;
import com.orbitos.portfolio.entity.About;
import com.orbitos.portfolio.mapper.AboutMapper;
import com.orbitos.portfolio.repository.AboutRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AboutService {

    private static final Logger log = LoggerFactory.getLogger(AboutService.class);

    private final AboutRepository aboutRepository;
    private final AboutMapper aboutMapper;
    private final AboutService self;

    public AboutService(AboutRepository aboutRepository, AboutMapper aboutMapper, @Lazy AboutService self) {
        this.aboutRepository = aboutRepository;
        this.aboutMapper = aboutMapper;
        this.self = self;
    }

    @Transactional(readOnly = true)
    public AboutDto getAbout() {
        About about = aboutRepository.findFirstByOrderByIdAsc()
                .orElseGet(self::createDefaultAbout);
        log.debug("getAbout: id={}, contentLength={}", about.getId(), about.getContent() != null ? about.getContent().length() : 0);
        return aboutMapper.toDto(about);
    }

    private static final String DEFAULT_ABOUT_CONTENT = "> cat about.txt\n\nYour bio will appear here. Sign in as admin to edit.";

    /**
     * Self-healing: ensure singleton row exists. Runs in its own transaction so insert commits.
     */
    @Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW)
    public About createDefaultAbout() {
        log.info("createDefaultAbout: inserting default about row");
        About defaultAbout = About.builder()
                .content(DEFAULT_ABOUT_CONTENT)
                .updatedAt(Instant.now())
                .build();
        About saved = aboutRepository.save(defaultAbout);
        log.info("createDefaultAbout: created id={}", saved.getId());
        return saved;
    }

    @Transactional
    public void updateContent(String content) {
        About about = aboutRepository.findFirstByOrderByIdAsc()
                .orElseGet(self::createDefaultAbout);
        String newContent = content != null ? content : "";
        log.info("updateContent: id={}, contentLength={}", about.getId(), newContent.length());
        about.setContent(newContent);
        about.setUpdatedAt(Instant.now());
        aboutRepository.saveAndFlush(about);
        log.info("updateContent: saved and flushed id={}", about.getId());
    }
}
