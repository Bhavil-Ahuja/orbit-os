package com.orbitos.portfolio.controller;

import com.orbitos.portfolio.dto.ProjectDto;
import com.orbitos.portfolio.service.domain.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/projects")
public class ProjectPublicController {

    private final ProjectService projectService;

    public ProjectPublicController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto>> list(
            @RequestParam(name = "preview", required = false) Boolean preview) {
        List<ProjectDto> projects = Boolean.TRUE.equals(preview)
                ? projectService.findAllForPreview()
                : projectService.findAllPublished();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProjectDto> getBySlug(
            @PathVariable String slug,
            @RequestParam(name = "preview", required = false) Boolean preview) {
        ProjectDto project = Boolean.TRUE.equals(preview)
                ? projectService.findBySlugIncludingDraft(slug)
                : projectService.findBySlug(slug);
        return ResponseEntity.ok(project);
    }
}
