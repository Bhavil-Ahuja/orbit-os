package com.orbitos.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateProjectRequestDto {

    private String title;
    private String slug;
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
