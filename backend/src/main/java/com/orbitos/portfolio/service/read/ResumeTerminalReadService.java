package com.orbitos.portfolio.service.read;

import com.orbitos.portfolio.dto.ResumeTerminalDto;
import com.orbitos.portfolio.entity.Resume;
import com.orbitos.portfolio.exception.ResourceNotFoundException;
import com.orbitos.portfolio.mapper.ResumeTerminalMapper;
import com.orbitos.portfolio.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Read-model service: loads resume entity and maps terminal_data to view DTO.
 * Persistence (ResumeService) and presentation (ResumeTerminalMapper) stay separate.
 */
@Service
public class ResumeTerminalReadService {

    private static final String RESUME_RESOURCE = "Resume";

    private final ResumeRepository resumeRepository;
    private final ResumeTerminalMapper resumeTerminalMapper;

    public ResumeTerminalReadService(ResumeRepository resumeRepository, ResumeTerminalMapper resumeTerminalMapper) {
        this.resumeRepository = resumeRepository;
        this.resumeTerminalMapper = resumeTerminalMapper;
    }

    @Transactional(readOnly = true)
    public ResumeTerminalDto getResumeTerminal() {
        Resume resume = resumeRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException(RESUME_RESOURCE, "singleton"));
        return resumeTerminalMapper.toTerminalDto(resume.getTerminalData());
    }

    /** For bootstrap: return terminal data when resume exists, empty otherwise (no 404). */
    @Transactional(readOnly = true)
    public Optional<ResumeTerminalDto> getResumeTerminalOptional() {
        return resumeRepository.findFirstByOrderByIdAsc()
                .map(resume -> resumeTerminalMapper.toTerminalDto(resume.getTerminalData()));
    }
}
