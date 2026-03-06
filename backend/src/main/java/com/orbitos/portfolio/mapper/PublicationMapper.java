package com.orbitos.portfolio.mapper;

import com.orbitos.portfolio.dto.PublicationDto;
import com.orbitos.portfolio.entity.Publication;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PublicationMapper {

    PublicationDto toDto(Publication entity);

    List<PublicationDto> toDtoList(List<Publication> entities);
}
