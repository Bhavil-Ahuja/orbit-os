package com.orbitos.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSystemCategoryRequestDto {

    @NotBlank
    private String slug;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    @Size(min = 1, max = 6)
    private List<String> bulletPoints;

    private Integer sortOrder;
}
