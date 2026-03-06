package com.orbitos.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PublicationDto {

    private Long id;
    private String slug;
    private String title;
    private String authors;
    private String venue;
    private String year;
    private String url;
    private String description;
}
