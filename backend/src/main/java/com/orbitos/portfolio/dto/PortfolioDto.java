package com.orbitos.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PortfolioDto {

    private AboutDto about;
    private List<ExperienceDto> experience;
    private List<ProjectDto> projects;
    private List<SkillDto> skills;
    private List<PublicationDto> publications;
}
