package com.orbitos.portfolio.mapper;

import com.orbitos.portfolio.dto.ExperienceDto;
import com.orbitos.portfolio.entity.Experience;
import org.mapstruct.CollectionMappingStrategy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    collectionMappingStrategy = CollectionMappingStrategy.TARGET_IMMUTABLE
)
public interface ExperienceMapper {

    @Mapping(target = "impact", defaultExpression = "java(java.util.List.of())")
    ExperienceDto toDto(Experience entity);

    List<ExperienceDto> toDtoList(List<Experience> entities);
}
