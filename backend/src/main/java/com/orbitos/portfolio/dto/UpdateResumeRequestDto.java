package com.orbitos.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateResumeRequestDto {

    @NotBlank
    private String viewUrl;

    @NotBlank
    private String downloadUrl;

    private Object terminalData;
}
