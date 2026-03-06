package com.orbitos.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateProjectRequestDto {

    @NotBlank
    private String title;

    @NotBlank
    private String slug;

    private String status;

    @NotBlank
    private String type;

    @NotBlank
    private String role;

    @NotBlank
    private String scale;

    @NotBlank
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
