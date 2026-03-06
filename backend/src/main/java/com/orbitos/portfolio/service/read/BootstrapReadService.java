package com.orbitos.portfolio.service.read;

import com.orbitos.portfolio.dto.BootstrapDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Assembles all read-model data for the bootstrap endpoint.
 * Each delegate is already cached; this gives the frontend one request to load the site.
 */
@Service
public class BootstrapReadService {

    private final NavigationReadService navigationReadService;
    private final PortfolioReadService portfolioReadService;
    private final SkillOrbitReadService skillOrbitReadService;
    private final ResumeTerminalReadService resumeTerminalReadService;

    public BootstrapReadService(
            NavigationReadService navigationReadService,
            PortfolioReadService portfolioReadService,
            SkillOrbitReadService skillOrbitReadService,
            ResumeTerminalReadService resumeTerminalReadService) {
        this.navigationReadService = navigationReadService;
        this.portfolioReadService = portfolioReadService;
        this.skillOrbitReadService = skillOrbitReadService;
        this.resumeTerminalReadService = resumeTerminalReadService;
    }

    @Transactional(readOnly = true)
    public BootstrapDto getBootstrap() {
        return BootstrapDto.builder()
                .navigation(navigationReadService.getNavigation())
                .portfolio(portfolioReadService.getPortfolio())
                .skillsOrbit(skillOrbitReadService.getSkillsByOrbit())
                .resumeTerminal(resumeTerminalReadService.getResumeTerminal())
                .build();
    }
}
