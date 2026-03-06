package com.orbitos.portfolio.mapper;

import com.orbitos.portfolio.dto.ProjectDto;
import com.orbitos.portfolio.entity.Project;
import com.orbitos.portfolio.entity.ProjectState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ProjectMapper")
class ProjectMapperTest {

    private ProjectMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new ProjectMapperImpl();
    }

    @Nested
    @DisplayName("toDto")
    class ToDto {

        @Test
        @DisplayName("maps featured to flagship")
        void featuredMapsToFlagship() {
            Project entity = minimalProject().featured(true).build();
            ProjectDto dto = mapper.toDto(entity);
            assertThat(dto.getFlagship()).isTrue();
        }

        @Test
        @DisplayName("maps projectType to type")
        void projectTypeMapsToType() {
            String type = "Console / Portfolio";
            Project entity = minimalProject().projectType(type).build();
            ProjectDto dto = mapper.toDto(entity);
            assertThat(dto.getType()).isEqualTo(type);
        }

        @Test
        @DisplayName("null list fields become empty lists")
        void nullListFieldsBecomeEmptyLists() {
            Project entity = minimalProject().build();
            entity.setImpact(null);
            entity.setTechStack(null);
            entity.setDesignDecisions(null);
            entity.setTechnicalChallenges(null);
            entity.setScreenshots(null);

            ProjectDto dto = mapper.toDto(entity);

            assertThat(dto.getImpact()).isEmpty();
            assertThat(dto.getTechStack()).isEmpty();
            assertThat(dto.getDesignDecisions()).isEmpty();
            assertThat(dto.getTechnicalChallenges()).isEmpty();
            assertThat(dto.getScreenshots()).isEmpty();
        }

        @Test
        @DisplayName("does not return null collections")
        void doesNotReturnNullCollections() {
            Project entity = minimalProject().build();
            entity.setImpact(null);
            entity.setTechStack(null);
            entity.setDesignDecisions(null);
            entity.setTechnicalChallenges(null);
            entity.setScreenshots(null);

            ProjectDto dto = mapper.toDto(entity);

            assertThat(dto.getImpact()).isNotNull();
            assertThat(dto.getTechStack()).isNotNull();
            assertThat(dto.getDesignDecisions()).isNotNull();
            assertThat(dto.getTechnicalChallenges()).isNotNull();
            assertThat(dto.getScreenshots()).isNotNull();
        }

        @Test
        @DisplayName("maps non-null lists as immutable")
        void mapsNonNullLists() {
            Project entity = minimalProject()
                    .impact(List.of("Impact one"))
                    .techStack(List.of("React", "Node"))
                    .build();

            ProjectDto dto = mapper.toDto(entity);

            assertThat(dto.getImpact()).containsExactly("Impact one");
            assertThat(dto.getTechStack()).containsExactly("React", "Node");
            assertThat(dto.getImpact()).isUnmodifiable();
            assertThat(dto.getTechStack()).isUnmodifiable();
        }
    }

    @Nested
    @DisplayName("toDtoList")
    class ToDtoList {

        @Test
        @DisplayName("maps list of entities")
        void mapsList() {
            Project a = minimalProject().slug("a").title("A").build();
            Project b = minimalProject().slug("b").title("B").build();
            List<ProjectDto> dtos = mapper.toDtoList(List.of(a, b));
            assertThat(dtos).hasSize(2);
            assertThat(dtos.get(0).getSlug()).isEqualTo("a");
            assertThat(dtos.get(1).getSlug()).isEqualTo("b");
        }

        @Test
        @DisplayName("null input returns empty list")
        void nullInputReturnsEmptyList() {
            List<ProjectDto> dtos = mapper.toDtoList(null);
            assertThat(dtos).isNotNull().isEmpty();
        }
    }

    private static Project.ProjectBuilder minimalProject() {
        Instant now = Instant.now();
        return Project.builder()
                .slug("test-slug")
                .title("Test Project")
                .projectType("Type")
                .role("Role")
                .scale("Scale")
                .missionObjective("Mission")
                .featured(false)
                .state(ProjectState.PUBLISHED)
                .createdAt(now)
                .updatedAt(now);
    }
}
