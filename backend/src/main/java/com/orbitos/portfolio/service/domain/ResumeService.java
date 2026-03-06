package com.orbitos.portfolio.service.domain;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitos.portfolio.dto.ResumeDto;
import com.orbitos.portfolio.dto.ResumeTerminalDto;
import com.orbitos.portfolio.dto.UpdateResumeRequestDto;
import com.orbitos.portfolio.entity.Resume;
import com.orbitos.portfolio.exception.ResourceNotFoundException;
import com.orbitos.portfolio.mapper.ResumeMapper;
import com.orbitos.portfolio.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ResumeService {

    private static final String RESUME_RESOURCE = "Resume";

    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;
    private final ObjectMapper objectMapper;

    public ResumeService(ResumeRepository resumeRepository, ResumeMapper resumeMapper, ObjectMapper objectMapper) {
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public ResumeDto getResume() {
        Resume resume = resumeRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException(RESUME_RESOURCE, "singleton"));
        return resumeMapper.toDto(resume);
    }

    @Transactional
    public ResumeDto updateResume(UpdateResumeRequestDto dto) {
        Resume resume = resumeRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException(RESUME_RESOURCE, "singleton"));
        resume.setViewUrl(dto.getViewUrl());
        resume.setDownloadUrl(dto.getDownloadUrl());
        if (dto.getTerminalData() != null) {
            try {
                ResumeTerminalDto validated = objectMapper.convertValue(dto.getTerminalData(), ResumeTerminalDto.class);
                resume.setTerminalData(objectMapper.writeValueAsString(validated));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("terminalData must match ResumeTerminalDto structure (name, title, sections)", e);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("terminalData must be valid JSON", e);
            }
        } else {
            resume.setTerminalData(null);
        }
        resume.setUpdatedAt(Instant.now());
        resume = resumeRepository.save(resume);
        return resumeMapper.toDto(resume);
    }
}
