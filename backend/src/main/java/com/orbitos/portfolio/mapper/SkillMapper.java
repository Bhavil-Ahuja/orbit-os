package com.orbitos.portfolio.mapper;

import com.orbitos.portfolio.dto.SkillDto;
import com.orbitos.portfolio.entity.Skill;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SkillMapper {

    @Mapping(target = "category", source = "category.name")
    @Mapping(target = "categoryId", source = "category.id")
    SkillDto toDto(Skill entity);

    List<SkillDto> toDtoList(List<Skill> entities);
}
