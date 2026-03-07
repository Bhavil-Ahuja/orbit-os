package com.orbitos.portfolio.service.domain;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orbitos.portfolio.dto.ResumeDto;
import com.orbitos.portfolio.dto.ResumeTerminalDto;
import com.orbitos.portfolio.dto.UpdateResumeRequestDto;
import com.orbitos.portfolio.entity.Resume;
import com.orbitos.portfolio.exception.ResourceNotFoundException;
import com.orbitos.portfolio.mapper.ResumeMapper;
import com.orbitos.portfolio.repository.ResumeRepository;
import com.orbitos.portfolio.service.CloudinaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Optional;

@Service
public class ResumeService {

    private static final Logger log = LoggerFactory.getLogger(ResumeService.class);
    private static final String RESUME_RESOURCE = "Resume";

    private final ResumeRepository resumeRepository;
    private final ResumeMapper resumeMapper;
    private final ObjectMapper objectMapper;
    private final CloudinaryService cloudinaryService;
    private final PdfToTerminalParser pdfToTerminalParser;

    public ResumeService(ResumeRepository resumeRepository, ResumeMapper resumeMapper, ObjectMapper objectMapper,
                         CloudinaryService cloudinaryService, PdfToTerminalParser pdfToTerminalParser) {
        this.resumeRepository = resumeRepository;
        this.resumeMapper = resumeMapper;
        this.objectMapper = objectMapper;
        this.cloudinaryService = cloudinaryService;
        this.pdfToTerminalParser = pdfToTerminalParser;
    }

    @Transactional(readOnly = true)
    public Optional<ResumeDto> getResumeOptional() {
        return resumeRepository.findFirstByOrderByIdAsc()
                .map(resumeMapper::toDto);
    }

    /** Clears view and download URL when the stored URL is no longer reachable (e.g. file deleted from Cloudinary). */
    @Transactional
    public void clearUrlsIfUnreachable() {
        resumeRepository.findFirstByOrderByIdAsc().ifPresent(resume -> {
            resume.setViewUrl("");
            resume.setDownloadUrl("");
            resume.setUpdatedAt(Instant.now());
            resumeRepository.save(resume);
        });
    }

    @Transactional(readOnly = true)
    public ResumeDto getResume() {
        Resume resume = resumeRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException(RESUME_RESOURCE, "singleton"));
        return resumeMapper.toDto(resume);
    }

    @Transactional
    public ResumeDto updateResume(UpdateResumeRequestDto dto) {
        Resume resume = resumeRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException(RESUME_RESOURCE, "singleton"));
        resume.setViewUrl(dto.getViewUrl());
        resume.setDownloadUrl(dto.getDownloadUrl());
        if (dto.getTerminalData() != null) {
            try {
                ResumeTerminalDto validated = objectMapper.convertValue(dto.getTerminalData(), ResumeTerminalDto.class);
                resume.setTerminalData(objectMapper.writeValueAsString(validated));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("terminalData must match ResumeTerminalDto structure (name, title, sections)", e);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("terminalData must be valid JSON", e);
            }
        } else {
            resume.setTerminalData(null);
        }
        resume.setUpdatedAt(Instant.now());
        resume = resumeRepository.save(resume);
        return resumeMapper.toDto(resume);
    }

    /**
     * Uploads the file to Cloudinary and updates the resume singleton with the returned URL
     * (both view and download use the same URL). Parses the PDF to extract text for terminal view
     * and stores it in terminal_data. Creates the resume row if it does not exist.
     */
    @Transactional
    public ResumeDto uploadResumeFile(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        ResumeTerminalDto terminalData = null;
        try {
            terminalData = pdfToTerminalParser.parse(bytes);
        } catch (Exception e) {
            log.warn("Resume PDF parse failed, terminal view will be empty: {}", e.getMessage());
        }
        String url = cloudinaryService.uploadRaw(file);
        Resume resume = resumeRepository.findFirstByOrderByIdAsc().orElse(null);
        if (resume == null) {
            resume = Resume.builder()
                    .viewUrl(url)
                    .downloadUrl(url)
                    .terminalData(terminalData != null ? objectMapper.writeValueAsString(terminalData) : null)
                    .updatedAt(Instant.now())
                    .build();
            resume = resumeRepository.save(resume);
            return resumeMapper.toDto(resume);
        }
        UpdateResumeRequestDto dto = new UpdateResumeRequestDto(url, url, terminalData);
        return updateResume(dto);
    }
}
