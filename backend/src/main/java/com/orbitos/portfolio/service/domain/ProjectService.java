package com.orbitos.portfolio.service.domain;

import com.orbitos.portfolio.dto.CreateProjectRequestDto;
import com.orbitos.portfolio.dto.ProjectDto;
import com.orbitos.portfolio.dto.UpdateProjectRequestDto;
import com.orbitos.portfolio.entity.Project;
import com.orbitos.portfolio.exception.DuplicateResourceException;
import com.orbitos.portfolio.exception.ResourceNotFoundException;
import com.orbitos.portfolio.mapper.ProjectMapper;
import com.orbitos.portfolio.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static com.orbitos.portfolio.entity.ProjectState.DRAFT;
import static com.orbitos.portfolio.entity.ProjectState.PUBLISHED;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    public ProjectService(ProjectRepository projectRepository, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> findAllPublished() {
        List<Project> projects = projectRepository.findAllByStateOrderBySortOrderAsc(PUBLISHED);
        return projectMapper.toDtoList(projects);
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> findAllForPreview() {
        List<Project> projects = projectRepository.findAllByStateInOrderBySortOrderAsc(List.of(PUBLISHED, DRAFT));
        return projectMapper.toDtoList(projects);
    }

    @Transactional(readOnly = true)
    public ProjectDto findBySlug(String slug) {
        return projectRepository.findBySlugAndState(slug, PUBLISHED)
                .map(projectMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Project", slug));
    }

    @Transactional(readOnly = true)
    public ProjectDto findBySlugIncludingDraft(String slug) {
        return projectRepository.findBySlug(slug)
                .map(projectMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Project", slug));
    }

    @Transactional
    public Long createProject(CreateProjectRequestDto dto) {
        if (projectRepository.existsBySlug(dto.getSlug())) {
            throw new DuplicateResourceException("Project slug already exists");
        }
        Instant now = Instant.now();
        Project project = Project.builder()
                .title(dto.getTitle())
                .slug(dto.getSlug())
                .status(dto.getStatus() != null ? dto.getStatus() : "OPERATIONAL")
                .projectType(dto.getType())
                .role(dto.getRole())
                .scale(dto.getScale())
                .missionObjective(dto.getMissionObjective())
                .architectureOverview(dto.getArchitectureOverview())
                .githubUrl(dto.getGithubUrl())
                .liveUrl(dto.getLiveUrl())
                .impact(dto.getImpact() != null ? dto.getImpact() : new ArrayList<>())
                .techStack(dto.getTechStack() != null ? dto.getTechStack() : new ArrayList<>())
                .designDecisions(dto.getDesignDecisions() != null ? dto.getDesignDecisions() : new ArrayList<>())
                .technicalChallenges(dto.getTechnicalChallenges() != null ? dto.getTechnicalChallenges() : new ArrayList<>())
                .screenshots(dto.getScreenshots() != null ? dto.getScreenshots() : new ArrayList<>())
                .state(PUBLISHED)
                .createdAt(now)
                .updatedAt(now)
                .build();
        project = projectRepository.save(project);
        return project.getId();
    }

    @Transactional
    public ProjectDto updateProject(Long id, UpdateProjectRequestDto dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", String.valueOf(id)));
        if (dto.getTitle() != null) project.setTitle(dto.getTitle());
        if (dto.getSlug() != null) {
            if (projectRepository.existsBySlug(dto.getSlug()) && !dto.getSlug().equals(project.getSlug())) {
                throw new DuplicateResourceException("Project slug already exists");
            }
            project.setSlug(dto.getSlug());
        }
        if (dto.getStatus() != null) project.setStatus(dto.getStatus());
        if (dto.getType() != null) project.setProjectType(dto.getType());
        if (dto.getRole() != null) project.setRole(dto.getRole());
        if (dto.getScale() != null) project.setScale(dto.getScale());
        if (dto.getMissionObjective() != null) project.setMissionObjective(dto.getMissionObjective());
        if (dto.getArchitectureOverview() != null) project.setArchitectureOverview(dto.getArchitectureOverview());
        if (dto.getGithubUrl() != null) project.setGithubUrl(dto.getGithubUrl());
        if (dto.getLiveUrl() != null) project.setLiveUrl(dto.getLiveUrl());
        if (dto.getImpact() != null) project.setImpact(dto.getImpact());
        if (dto.getTechStack() != null) project.setTechStack(dto.getTechStack());
        if (dto.getDesignDecisions() != null) project.setDesignDecisions(dto.getDesignDecisions());
        if (dto.getTechnicalChallenges() != null) project.setTechnicalChallenges(dto.getTechnicalChallenges());
        if (dto.getScreenshots() != null) project.setScreenshots(dto.getScreenshots());
        project = projectRepository.save(project);
        return projectMapper.toDto(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", String.valueOf(id)));
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDto publishProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", String.valueOf(id)));
        project.setState(PUBLISHED);
        project = projectRepository.save(project);
        return projectMapper.toDto(project);
    }
}
