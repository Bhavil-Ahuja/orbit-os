package com.orbitos.portfolio.repository;

import com.orbitos.portfolio.entity.Project;
import com.orbitos.portfolio.entity.ProjectState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findAllByStateOrderBySortOrderAsc(ProjectState state);

    List<Project> findAllByStateInOrderBySortOrderAsc(List<ProjectState> states);

    Optional<Project> findBySlugAndState(String slug, ProjectState state);

    Optional<Project> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
