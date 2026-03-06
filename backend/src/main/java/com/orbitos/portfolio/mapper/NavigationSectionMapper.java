package com.orbitos.portfolio.mapper;

import com.orbitos.portfolio.dto.NavigationDto;
import com.orbitos.portfolio.entity.NavigationSection;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface NavigationSectionMapper {

    NavigationDto.NavSectionDto toDto(NavigationSection entity);

    List<NavigationDto.NavSectionDto> toDtoList(List<NavigationSection> entities);
}
