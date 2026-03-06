package com.orbitos.portfolio.service;

import com.orbitos.portfolio.dto.CreateSkillRequestDto;
import com.orbitos.portfolio.dto.SkillDto;
import com.orbitos.portfolio.dto.UpdateSkillRequestDto;
import com.orbitos.portfolio.entity.Skill;
import com.orbitos.portfolio.entity.SkillCategory;
import com.orbitos.portfolio.exception.ResourceNotFoundException;
import com.orbitos.portfolio.mapper.SkillMapper;
import com.orbitos.portfolio.repository.SkillCategoryRepository;
import com.orbitos.portfolio.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final SkillMapper skillMapper;

    private final SkillCategoryRepository skillCategoryRepository;

    public SkillService(SkillRepository skillRepository, SkillMapper skillMapper,
                        SkillCategoryRepository skillCategoryRepository) {
        this.skillRepository = skillRepository;
        this.skillMapper = skillMapper;
        this.skillCategoryRepository = skillCategoryRepository;
    }

    @Transactional(readOnly = true)
    public List<SkillDto> findAll() {
        List<Skill> skills = skillRepository.findAllOrdered();
        return skillMapper.toDtoList(skills);
    }

    @Transactional
    public Long createSkill(CreateSkillRequestDto dto) {
        SkillCategory category = skillCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("SkillCategory", String.valueOf(dto.getCategoryId())));
        Skill skill = Skill.builder()
                .name(dto.getName())
                .category(category)
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .build();
        skill = skillRepository.save(skill);
        return skill.getId();
    }

    @Transactional
    public SkillDto updateSkill(Long id, UpdateSkillRequestDto dto) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", String.valueOf(id)));
        if (dto.getName() != null) skill.setName(dto.getName());
        if (dto.getCategoryId() != null) {
            SkillCategory category = skillCategoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("SkillCategory", String.valueOf(dto.getCategoryId())));
            skill.setCategory(category);
        }
        if (dto.getSortOrder() != null) skill.setSortOrder(dto.getSortOrder());
        skill = skillRepository.save(skill);
        return skillMapper.toDto(skill);
    }

    @Transactional
    public void deleteSkill(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", String.valueOf(id)));
        skillRepository.delete(skill);
    }
}
