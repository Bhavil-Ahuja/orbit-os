package com.orbitos.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePublicationRequestDto {

    @NotBlank
    private String slug;

    @NotBlank
    private String title;

    private String authors;
    private String venue;
    private String year;
    private String url;
    private String description;
    private Integer sortOrder;
}
