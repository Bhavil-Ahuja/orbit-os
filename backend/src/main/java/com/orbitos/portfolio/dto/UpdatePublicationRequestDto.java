package com.orbitos.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePublicationRequestDto {

    private String slug;
    private String title;
    private String authors;
    private String venue;
    private String year;
    private String url;
    private String description;
    private Integer sortOrder;
}
