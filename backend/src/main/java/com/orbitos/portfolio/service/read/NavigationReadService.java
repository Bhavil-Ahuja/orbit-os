package com.orbitos.portfolio.service.read;

import com.orbitos.portfolio.dto.NavigationDto;
import com.orbitos.portfolio.dto.SocialLinkDto;
import com.orbitos.portfolio.entity.NavigationSection;
import com.orbitos.portfolio.mapper.NavigationSectionMapper;
import com.orbitos.portfolio.repository.NavigationSectionRepository;
import com.orbitos.portfolio.service.SocialLinkService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NavigationReadService {

    private final NavigationSectionRepository navigationSectionRepository;
    private final NavigationSectionMapper navigationSectionMapper;
    private final SocialLinkService socialLinkService;

    public NavigationReadService(
            NavigationSectionRepository navigationSectionRepository,
            NavigationSectionMapper navigationSectionMapper,
            SocialLinkService socialLinkService) {
        this.navigationSectionRepository = navigationSectionRepository;
        this.navigationSectionMapper = navigationSectionMapper;
        this.socialLinkService = socialLinkService;
    }

    @Cacheable(value = "navigation", key = "'all'")
    @Transactional(readOnly = true)
    public NavigationDto getNavigation() {
        List<NavigationSection> sections = navigationSectionRepository.findAllByVisibleTrueOrderBySortOrderAsc();
        List<SocialLinkDto> socialLinks = socialLinkService.findAll();
        return NavigationDto.builder()
                .sections(navigationSectionMapper.toDtoList(sections))
                .socialLinks(socialLinks != null ? socialLinks : List.of())
                .build();
    }
}
