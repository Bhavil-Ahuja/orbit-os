package com.orbitos.portfolio.mapper;

import com.orbitos.portfolio.dto.SocialLinkDto;
import com.orbitos.portfolio.entity.SocialLink;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SocialLinkMapper {

    SocialLinkDto toDto(SocialLink entity);

    List<SocialLinkDto> toDtoList(List<SocialLink> entities);
}
