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
public class SystemCategoryDto {

    private Long id;
    private String slug;
    private String title;
    private String description;
    private List<String> bulletPoints;
    private Integer sortOrder;
}
