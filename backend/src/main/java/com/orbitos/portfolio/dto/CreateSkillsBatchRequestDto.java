package com.orbitos.portfolio.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSkillsBatchRequestDto {

    @NotNull
    private Long categoryId;

    @NotEmpty(message = "At least one skill name is required")
    private List<String> names;
}
