package com.orbitos.portfolio.service.read;

import com.orbitos.portfolio.dto.PortfolioDto;
import com.orbitos.portfolio.service.AboutService;
import com.orbitos.portfolio.service.ExperienceService;
import com.orbitos.portfolio.service.PublicationService;
import com.orbitos.portfolio.service.SkillService;
import com.orbitos.portfolio.service.domain.ProjectService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-model service: aggregates about, experience, projects, skills, publications
 * for initial frontend load. Orchestration and future caching/async live here, not in controller.
 */
@Service
public class PortfolioReadService {

    private final AboutService aboutService;
    private final ExperienceService experienceService;
    private final ProjectService projectService;
    private final SkillService skillService;
    private final PublicationService publicationService;

    public PortfolioReadService(
            AboutService aboutService,
            ExperienceService experienceService,
            ProjectService projectService,
            SkillService skillService,
            PublicationService publicationService) {
        this.aboutService = aboutService;
        this.experienceService = experienceService;
        this.projectService = projectService;
        this.skillService = skillService;
        this.publicationService = publicationService;
    }

    @Cacheable(value = "portfolio", key = "'all'")
    @Transactional(readOnly = true)
    public PortfolioDto getPortfolio() {
        return PortfolioDto.builder()
                .about(aboutService.getAbout())
                .experience(experienceService.findAll())
                .projects(projectService.findAllPublished())
                .skills(skillService.findAll())
                .publications(publicationService.findAll())
                .build();
    }
}
