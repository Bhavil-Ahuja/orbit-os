package com.orbitos.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateExperienceRequestDto {

    @NotBlank
    private String slug;

    @NotBlank
    private String mission;

    @NotBlank
    private String role;

    private String status;

    @NotBlank
    private String period;

    private List<String> impact;

    private Integer sortOrder;
}
