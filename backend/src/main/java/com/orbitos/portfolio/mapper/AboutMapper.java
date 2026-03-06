package com.orbitos.portfolio.mapper;

import com.orbitos.portfolio.dto.AboutDto;
import com.orbitos.portfolio.entity.About;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AboutMapper {

    AboutDto toDto(About entity);
}
