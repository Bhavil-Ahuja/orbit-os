package com.orbitos.portfolio.service;

import com.orbitos.portfolio.dto.SocialLinkDto;
import com.orbitos.portfolio.entity.SocialLink;
import com.orbitos.portfolio.mapper.SocialLinkMapper;
import com.orbitos.portfolio.repository.SocialLinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SocialLinkService {

    private final SocialLinkRepository socialLinkRepository;
    private final SocialLinkMapper socialLinkMapper;

    public SocialLinkService(SocialLinkRepository socialLinkRepository, SocialLinkMapper socialLinkMapper) {
        this.socialLinkRepository = socialLinkRepository;
        this.socialLinkMapper = socialLinkMapper;
    }

    @Transactional(readOnly = true)
    public List<SocialLinkDto> findAll() {
        List<SocialLink> links = socialLinkRepository.findAllByOrderBySortOrderAsc();
        return socialLinkMapper.toDtoList(links);
    }
}
