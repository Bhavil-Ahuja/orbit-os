package com.orbitos.portfolio.service;

import com.orbitos.portfolio.dto.CreateExperienceRequestDto;
import com.orbitos.portfolio.dto.ExperienceDto;
import com.orbitos.portfolio.dto.UpdateExperienceRequestDto;
import com.orbitos.portfolio.entity.Experience;
import com.orbitos.portfolio.exception.ResourceNotFoundException;
import com.orbitos.portfolio.mapper.ExperienceMapper;
import com.orbitos.portfolio.repository.ExperienceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final ExperienceMapper experienceMapper;

    public ExperienceService(ExperienceRepository experienceRepository, ExperienceMapper experienceMapper) {
        this.experienceRepository = experienceRepository;
        this.experienceMapper = experienceMapper;
    }

    @Transactional(readOnly = true)
    public List<ExperienceDto> findAll() {
        List<Experience> experiences = experienceRepository.findAllActiveFirstThenBySortOrder();
        return experienceMapper.toDtoList(experiences);
    }

    @Transactional
    public Long createExperience(CreateExperienceRequestDto dto) {
        Instant now = Instant.now();
        Experience experience = Experience.builder()
                .slug(dto.getSlug())
                .mission(dto.getMission())
                .role(dto.getRole())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .period(dto.getPeriod())
                .impact(dto.getImpact() != null ? dto.getImpact() : new ArrayList<>())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .createdAt(now)
                .updatedAt(now)
                .build();
        experience = experienceRepository.save(experience);
        return experience.getId();
    }

    @Transactional
    public ExperienceDto updateExperience(Long id, UpdateExperienceRequestDto dto) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience", String.valueOf(id)));
        if (dto.getSlug() != null) experience.setSlug(dto.getSlug());
        if (dto.getMission() != null) experience.setMission(dto.getMission());
        if (dto.getRole() != null) experience.setRole(dto.getRole());
        if (dto.getStatus() != null) experience.setStatus(dto.getStatus());
        if (dto.getPeriod() != null) experience.setPeriod(dto.getPeriod());
        if (dto.getImpact() != null) experience.setImpact(dto.getImpact());
        if (dto.getSortOrder() != null) experience.setSortOrder(dto.getSortOrder());
        experience.setUpdatedAt(Instant.now());
        experience = experienceRepository.save(experience);
        return experienceMapper.toDto(experience);
    }

    @Transactional
    public void deleteExperience(Long id) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience", String.valueOf(id)));
        experienceRepository.delete(experience);
    }

    @Transactional
    public void reorder(List<Long> orderedIds) {
        if (orderedIds == null || orderedIds.isEmpty()) return;
        for (int i = 0; i < orderedIds.size(); i++) {
            final int sortOrder = i;
            final Long id = orderedIds.get(i);
            Experience e = experienceRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Experience", String.valueOf(id)));
            e.setSortOrder(sortOrder);
            e.setUpdatedAt(Instant.now());
        }
        experienceRepository.flush();
    }
}
