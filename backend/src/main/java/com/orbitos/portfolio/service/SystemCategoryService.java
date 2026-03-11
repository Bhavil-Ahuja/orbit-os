package com.orbitos.portfolio.service;

import com.orbitos.portfolio.dto.CreateSystemCategoryRequestDto;
import com.orbitos.portfolio.dto.SystemCategoryDto;
import com.orbitos.portfolio.dto.UpdateSystemCategoryRequestDto;
import com.orbitos.portfolio.entity.SystemCategory;
import com.orbitos.portfolio.exception.ResourceNotFoundException;
import com.orbitos.portfolio.mapper.SystemCategoryMapper;
import com.orbitos.portfolio.repository.SystemCategoryRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class SystemCategoryService {

    private final SystemCategoryRepository systemCategoryRepository;
    private final SystemCategoryMapper systemCategoryMapper;

    public SystemCategoryService(SystemCategoryRepository systemCategoryRepository,
                                  SystemCategoryMapper systemCategoryMapper) {
        this.systemCategoryRepository = systemCategoryRepository;
        this.systemCategoryMapper = systemCategoryMapper;
    }

    @Cacheable(value = "systems", key = "'all'")
    @Transactional(readOnly = true)
    public List<SystemCategoryDto> findAll() {
        List<SystemCategory> list = systemCategoryRepository.findAllByOrderBySortOrderAsc();
        return systemCategoryMapper.toDtoList(list);
    }

    @Transactional
    public Long create(CreateSystemCategoryRequestDto dto) {
        Instant now = Instant.now();
        int sortOrder = dto.getSortOrder() != null
                ? dto.getSortOrder()
                : systemCategoryRepository.findTopByOrderBySortOrderDesc()
                        .map(e -> e.getSortOrder() + 1)
                        .orElse(0);
        SystemCategory entity = SystemCategory.builder()
                .slug(slugify(dto.getSlug()))
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .bulletPoints(dto.getBulletPoints() != null ? dto.getBulletPoints() : new ArrayList<>())
                .sortOrder(sortOrder)
                .createdAt(now)
                .updatedAt(now)
                .build();
        entity = systemCategoryRepository.save(entity);
        return entity.getId();
    }

    @Transactional
    public SystemCategoryDto update(Long id, UpdateSystemCategoryRequestDto dto) {
        SystemCategory entity = systemCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SystemCategory", String.valueOf(id)));
        if (dto.getSlug() != null) entity.setSlug(slugify(dto.getSlug()));
        if (dto.getTitle() != null) entity.setTitle(dto.getTitle().trim());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription().trim());
        if (dto.getBulletPoints() != null) entity.setBulletPoints(dto.getBulletPoints());
        if (dto.getSortOrder() != null) entity.setSortOrder(dto.getSortOrder());
        entity.setUpdatedAt(Instant.now());
        entity = systemCategoryRepository.save(entity);
        return systemCategoryMapper.toDto(entity);
    }

    private static String slugify(String s) {
        if (s == null) return null;
        return s.trim().toLowerCase()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9-]", "")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    @Transactional
    public void delete(Long id) {
        SystemCategory entity = systemCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SystemCategory", String.valueOf(id)));
        systemCategoryRepository.delete(entity);
    }

    @Transactional
    public void reorder(List<Long> orderedIds) {
        if (orderedIds == null || orderedIds.isEmpty()) return;
        for (int i = 0; i < orderedIds.size(); i++) {
            final int sortOrder = i;
            final Long id = orderedIds.get(i);
            SystemCategory entity = systemCategoryRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("SystemCategory", String.valueOf(id)));
            entity.setSortOrder(sortOrder);
            entity.setUpdatedAt(Instant.now());
        }
        systemCategoryRepository.flush();
    }
}
