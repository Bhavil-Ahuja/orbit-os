package com.orbitos.portfolio.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSystemCategoryRequestDto {

    private String slug;
    private String title;
    private String description;

    @Size(min = 1, max = 6)
    private List<String> bulletPoints;

    private Integer sortOrder;
}
