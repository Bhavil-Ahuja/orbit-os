package com.orbitos.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSkillRequestDto {

    private String name;
    private Long categoryId;
    private Integer sortOrder;
}
