package com.orbitos.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Single-response payload for GET /api/public/bootstrap.
 * Frontend loads the entire site with one request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BootstrapDto {

    private NavigationDto navigation;
    private PortfolioDto portfolio;
    private List<CategoryOrbitDto> skillsOrbit;
    private ResumeDto resume;
    private ResumeTerminalDto resumeTerminal;
}
