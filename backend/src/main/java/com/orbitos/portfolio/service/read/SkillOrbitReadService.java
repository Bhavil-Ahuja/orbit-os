package com.orbitos.portfolio.service.read;

import com.orbitos.portfolio.dto.CategoryOrbitDto;
import com.orbitos.portfolio.entity.Skill;
import com.orbitos.portfolio.repository.SkillRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SkillOrbitReadService {

    private final SkillRepository skillRepository;

    public SkillOrbitReadService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Cacheable(value = "skillOrbits", key = "'all'")
    @Transactional(readOnly = true)
    public List<CategoryOrbitDto> getSkillsByOrbit() {
        List<Skill> skills = skillRepository.findAllOrdered();
        Map<String, CategoryOrbitDto> byCategory = new LinkedHashMap<>();
        for (Skill skill : skills) {
            String categoryName = skill.getCategory().getName();
            byCategory.computeIfAbsent(categoryName, k -> CategoryOrbitDto.builder()
                    .category(categoryName)
                    .orbitIndex(skill.getCategory().getOrbitIndex())
                    .color(skill.getCategory().getColor())
                    .skills(new java.util.ArrayList<>())
                    .build());
            byCategory.get(categoryName).getSkills().add(
                    CategoryOrbitDto.SkillOrbitItemDto.builder()
                            .id(skill.getId())
                            .name(skill.getName())
                            .build());
        }
        byCategory.forEach((k, v) -> v.setSkills(v.getSkills() != null ? List.copyOf(v.getSkills()) : List.of()));
        return new ArrayList<>(byCategory.values());
    }
}
