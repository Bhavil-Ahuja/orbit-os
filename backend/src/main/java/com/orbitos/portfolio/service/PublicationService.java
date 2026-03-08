package com.orbitos.portfolio.service;

import com.orbitos.portfolio.dto.CreatePublicationRequestDto;
import com.orbitos.portfolio.dto.PublicationDto;
import com.orbitos.portfolio.dto.UpdatePublicationRequestDto;
import com.orbitos.portfolio.entity.Publication;
import com.orbitos.portfolio.exception.ResourceNotFoundException;
import com.orbitos.portfolio.mapper.PublicationMapper;
import com.orbitos.portfolio.repository.PublicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class PublicationService {

    private final PublicationRepository publicationRepository;
    private final PublicationMapper publicationMapper;

    public PublicationService(PublicationRepository publicationRepository, PublicationMapper publicationMapper) {
        this.publicationRepository = publicationRepository;
        this.publicationMapper = publicationMapper;
    }

    @Transactional(readOnly = true)
    public List<PublicationDto> findAll() {
        List<Publication> publications = publicationRepository.findAllByOrderBySortOrderAsc();
        return publicationMapper.toDtoList(publications);
    }

    @Transactional
    public Long createPublication(CreatePublicationRequestDto dto) {
        Instant now = Instant.now();
        Publication publication = Publication.builder()
                .slug(dto.getSlug())
                .title(dto.getTitle())
                .authors(dto.getAuthors())
                .venue(dto.getVenue())
                .year(dto.getYear())
                .url(dto.getUrl())
                .description(dto.getDescription())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .createdAt(now)
                .updatedAt(now)
                .build();
        publication = publicationRepository.save(publication);
        return publication.getId();
    }

    @Transactional
    public PublicationDto updatePublication(Long id, UpdatePublicationRequestDto dto) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publication", String.valueOf(id)));
        if (dto.getSlug() != null) publication.setSlug(dto.getSlug());
        if (dto.getTitle() != null) publication.setTitle(dto.getTitle());
        if (dto.getAuthors() != null) publication.setAuthors(dto.getAuthors());
        if (dto.getVenue() != null) publication.setVenue(dto.getVenue());
        if (dto.getYear() != null) publication.setYear(dto.getYear());
        if (dto.getUrl() != null) publication.setUrl(dto.getUrl());
        if (dto.getDescription() != null) publication.setDescription(dto.getDescription());
        if (dto.getSortOrder() != null) publication.setSortOrder(dto.getSortOrder());
        publication.setUpdatedAt(Instant.now());
        publication = publicationRepository.save(publication);
        return publicationMapper.toDto(publication);
    }

    @Transactional
    public void deletePublication(Long id) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publication", String.valueOf(id)));
        publicationRepository.delete(publication);
    }

    @Transactional
    public void reorder(List<Long> orderedIds) {
        if (orderedIds == null || orderedIds.isEmpty()) return;
        for (int i = 0; i < orderedIds.size(); i++) {
            final int sortOrder = i;
            final Long id = orderedIds.get(i);
            Publication p = publicationRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Publication", String.valueOf(id)));
            p.setSortOrder(sortOrder);
            p.setUpdatedAt(Instant.now());
        }
        publicationRepository.flush();
    }
}
