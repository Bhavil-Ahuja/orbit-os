package com.orbitos.portfolio.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitos.portfolio.dto.ResumeTerminalDto;
import org.springframework.stereotype.Component;

/**
 * Presentation mapping: parses terminal JSON to view DTO.
 * Not domain/persistence logic.
 */
@Component
public class ResumeTerminalMapper {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public ResumeTerminalDto toTerminalDto(String terminalDataJson) {
        if (terminalDataJson == null || terminalDataJson.isBlank()) {
            return ResumeTerminalDto.builder().sections(java.util.List.of()).build();
        }
        try {
            return OBJECT_MAPPER.readValue(terminalDataJson, ResumeTerminalDto.class);
        } catch (JsonProcessingException e) {
            return ResumeTerminalDto.builder().sections(java.util.List.of()).build();
        }
    }
}
