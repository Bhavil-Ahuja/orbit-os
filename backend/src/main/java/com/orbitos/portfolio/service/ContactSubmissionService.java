package com.orbitos.portfolio.service;

import com.orbitos.portfolio.dto.ContactSubmissionDto;
import com.orbitos.portfolio.dto.ContactSubmissionRequestDto;
import com.orbitos.portfolio.entity.ContactSubmission;
import com.orbitos.portfolio.repository.ContactSubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactSubmissionService {

    private final ContactSubmissionRepository repository;

    public ContactSubmissionService(ContactSubmissionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void submit(ContactSubmissionRequestDto dto) {
        ContactSubmission entity = ContactSubmission.builder()
                .name(dto.getName().trim())
                .email(dto.getEmail().trim().toLowerCase())
                .message(dto.getMessage().trim())
                .createdAt(Instant.now())
                .build();
        repository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<ContactSubmissionDto> findAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ContactSubmissionDto toDto(ContactSubmission e) {
        return ContactSubmissionDto.builder()
                .id(e.getId())
                .name(e.getName())
                .email(e.getEmail())
                .message(e.getMessage())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
