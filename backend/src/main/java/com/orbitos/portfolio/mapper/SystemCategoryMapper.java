package com.orbitos.portfolio.mapper;

import com.orbitos.portfolio.dto.SystemCategoryDto;
import com.orbitos.portfolio.entity.SystemCategory;
import org.mapstruct.CollectionMappingStrategy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(
    componentModel = MappingConstants.ComponentModel.SPRING,
    collectionMappingStrategy = CollectionMappingStrategy.TARGET_IMMUTABLE
)
public interface SystemCategoryMapper {

    @Mapping(target = "bulletPoints", defaultExpression = "java(java.util.List.of())")
    SystemCategoryDto toDto(SystemCategory entity);

    List<SystemCategoryDto> toDtoList(List<SystemCategory> entities);
}
