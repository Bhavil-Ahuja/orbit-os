package com.orbitos.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExperienceRequestDto {

    private String slug;
    private String mission;
    private String role;
    private String status;
    private String period;
    private List<String> impact;
    private Integer sortOrder;
}
