package com.orbitos.portfolio.service.read;

import com.orbitos.portfolio.dto.BootstrapDto;
import com.orbitos.portfolio.service.domain.ResumeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Assembles all read-model data for the bootstrap endpoint.
 * Returns navigation, portfolio, skillsOrbit, resume, resumeTerminal in one response.
 */
@Service
public class BootstrapReadService {

    private final NavigationReadService navigationReadService;
    private final PortfolioReadService portfolioReadService;
    private final SkillOrbitReadService skillOrbitReadService;
    private final ResumeTerminalReadService resumeTerminalReadService;
    private final ResumeService resumeService;

    public BootstrapReadService(
            NavigationReadService navigationReadService,
            PortfolioReadService portfolioReadService,
            SkillOrbitReadService skillOrbitReadService,
            ResumeTerminalReadService resumeTerminalReadService,
            ResumeService resumeService) {
        this.navigationReadService = navigationReadService;
        this.portfolioReadService = portfolioReadService;
        this.skillOrbitReadService = skillOrbitReadService;
        this.resumeTerminalReadService = resumeTerminalReadService;
        this.resumeService = resumeService;
    }

    @Transactional(readOnly = true)
    public BootstrapDto getBootstrap() {
        return BootstrapDto.builder()
                .navigation(navigationReadService.getNavigation())
                .portfolio(portfolioReadService.getPortfolio())
                .skillsOrbit(skillOrbitReadService.getSkillsByOrbit())
                .resume(resumeService.getResumeOptional().orElse(null))
                .resumeTerminal(resumeTerminalReadService.getResumeTerminalOptional().orElse(null))
                .build();
    }
}
