package com.orbitos.portfolio.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitos.portfolio.dto.ResumeDto;
import com.orbitos.portfolio.entity.Resume;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ResumeMapper {

    @Mapping(target = "terminalData", expression = "java(parseTerminalData(entity.getTerminalData()))")
    ResumeDto toDto(Resume entity);

    default Object parseTerminalData(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return new ObjectMapper().readValue(json, Object.class);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
