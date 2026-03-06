package com.orbitos.portfolio.converter;

import com.orbitos.portfolio.entity.ProjectState;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ProjectStateConverter implements AttributeConverter<ProjectState, String> {

    @Override
    public String convertToDatabaseColumn(ProjectState attribute) {
        if (attribute == null) return null;
        return attribute.name().toLowerCase();
    }

    @Override
    public ProjectState convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        return ProjectState.valueOf(dbData.trim().toUpperCase());
    }
}
