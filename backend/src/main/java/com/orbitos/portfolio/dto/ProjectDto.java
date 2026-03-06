package com.orbitos.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Public API response for project. Matches docs/portfolio-schemas.md shape.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectDto {

    private Long id;
    private String slug;
    private String title;
    private Boolean flagship;
    /** Publication state: DRAFT | PUBLISHED. Omitted or only PUBLISHED when not using preview. */
    private String state;
    private String status;
    private String type;
    private String role;
    private String scale;
    private String missionObjective;
    private List<String> impact;
    private List<String> techStack;
    private String githubUrl;
    private String liveUrl;
    private String architectureOverview;
    private List<String> designDecisions;
    private List<String> technicalChallenges;
    private List<String> screenshots;
}
