package com.orbitos.portfolio.service;

import com.orbitos.portfolio.dto.CreateSkillRequestDto;
import com.orbitos.portfolio.dto.SkillCategoryDto;
import com.orbitos.portfolio.dto.SkillDto;
import com.orbitos.portfolio.dto.UpdateSkillRequestDto;
import com.orbitos.portfolio.entity.Skill;
import com.orbitos.portfolio.entity.SkillCategory;
import com.orbitos.portfolio.exception.ResourceNotFoundException;
import com.orbitos.portfolio.mapper.SkillMapper;
import com.orbitos.portfolio.repository.SkillCategoryRepository;
import com.orbitos.portfolio.repository.SkillRepository;
import jakarta.persistence.EntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final SkillMapper skillMapper;

    private final SkillCategoryRepository skillCategoryRepository;
    private final EntityManager entityManager;

    public SkillService(SkillRepository skillRepository, SkillMapper skillMapper,
                        SkillCategoryRepository skillCategoryRepository, EntityManager entityManager) {
        this.skillRepository = skillRepository;
        this.skillMapper = skillMapper;
        this.skillCategoryRepository = skillCategoryRepository;
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public List<SkillDto> findAll() {
        List<Skill> skills = skillRepository.findAllOrdered();
        return skillMapper.toDtoList(skills);
    }

    @Transactional(readOnly = true)
    public List<SkillCategoryDto> findAllCategories() {
        return skillCategoryRepository.findAll().stream()
                .sorted(Comparator.comparing(SkillCategory::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(c -> new SkillCategoryDto(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    /** Idempotent seed: ensures default categories exist. Creates only missing ones by name (safe for concurrent or repeated calls). */
    @Transactional
    public void seedCategoriesIfEmpty() {
        var names = List.of(
                "Languages and Web Technologies",
                "Frameworks, Libraries & Cloud",
                "Databases & Tools",
                "Machine Learning & AI",
                "Architecture"
        );
        for (int i = 0; i < names.size(); i++) {
            String name = names.get(i);
            if (skillCategoryRepository.findByName(name).isPresent()) continue;
            SkillCategory cat = SkillCategory.builder()
                    .name(name)
                    .orbitIndex(i)
                    .sortOrder(i)
                    .build();
            try {
                skillCategoryRepository.save(cat);
            } catch (DataIntegrityViolationException e) {
                // Another request inserted this name concurrently; detach failed entity so session stays consistent
                entityManager.detach(cat);
            }
        }
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
        Skill saved = skillRepository.save(skill);
        // Reload with category fetched to avoid LazyInitializationException when mapping to DTO
        Skill withCategory = skillRepository.findByIdWithCategory(saved.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill", String.valueOf(saved.getId())));
        return skillMapper.toDto(withCategory);
    }

    @Transactional
    public void deleteSkill(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", String.valueOf(id)));
        skillRepository.delete(skill);
    }
}
