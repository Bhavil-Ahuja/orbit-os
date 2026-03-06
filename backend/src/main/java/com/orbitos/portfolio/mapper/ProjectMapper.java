package com.orbitos.portfolio.mapper;

import com.orbitos.portfolio.dto.ProjectDto;
import com.orbitos.portfolio.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProjectMapper {

    @Mapping(target = "flagship", source = "featured")
    @Mapping(target = "state", expression = "java(entity.getState() != null ? entity.getState().name() : null)")
    @Mapping(target = "type", source = "projectType")
    @Mapping(target = "impact", expression = "java(entity.getImpact() != null ? java.util.List.copyOf(entity.getImpact()) : java.util.List.of())")
    @Mapping(target = "techStack", expression = "java(entity.getTechStack() != null ? java.util.List.copyOf(entity.getTechStack()) : java.util.List.of())")
    @Mapping(target = "designDecisions", expression = "java(entity.getDesignDecisions() != null ? java.util.List.copyOf(entity.getDesignDecisions()) : java.util.List.of())")
    @Mapping(target = "technicalChallenges", expression = "java(entity.getTechnicalChallenges() != null ? java.util.List.copyOf(entity.getTechnicalChallenges()) : java.util.List.of())")
    @Mapping(target = "screenshots", expression = "java(entity.getScreenshots() != null ? java.util.List.copyOf(entity.getScreenshots()) : java.util.List.of())")
    ProjectDto toDto(Project entity);

    List<ProjectDto> mapList(List<Project> entities);

    default List<ProjectDto> toDtoList(List<Project> entities) {
        return entities == null ? List.of() : mapList(entities);
    }
}
