package com.orbitos.portfolio.entity;

import com.orbitos.portfolio.converter.ListStringJsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Project entity. JSON list fields use {@link ListStringJsonType}: stored as TEXT in H2,
 * JSONB in PostgreSQL (via {@link com.orbitos.portfolio.config.JsonColumnDefinitionHolder}).
 */
@Entity
@Table(name = "project")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String status = "OPERATIONAL";

    @Column(name = "project_type", nullable = false, length = 80)
    private String projectType;

    @Column(nullable = false, length = 80)
    private String role;

    @Column(nullable = false, length = 40)
    private String scale;

    @Column(name = "mission_objective", nullable = false, columnDefinition = "text")
    private String missionObjective;

    @Column(name = "architecture_overview", columnDefinition = "text")
    private String architectureOverview;

    @Column(name = "github_url", length = 512)
    private String githubUrl;

    @Column(name = "live_url", length = 512)
    private String liveUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProjectState state = ProjectState.PUBLISHED;

    @Column(nullable = false, columnDefinition = "text")
    @Type(ListStringJsonType.class)
    @Builder.Default
    private List<String> impact = new ArrayList<>();

    @Column(name = "design_decisions", nullable = false, columnDefinition = "text")
    @Type(ListStringJsonType.class)
    @Builder.Default
    private List<String> designDecisions = new ArrayList<>();

    @Column(name = "technical_challenges", nullable = false, columnDefinition = "text")
    @Type(ListStringJsonType.class)
    @Builder.Default
    private List<String> technicalChallenges = new ArrayList<>();

    @Column(name = "tech_stack", nullable = false, columnDefinition = "text")
    @Type(ListStringJsonType.class)
    @Builder.Default
    private List<String> techStack = new ArrayList<>();

    @Column(name = "screenshots", nullable = false, columnDefinition = "text")
    @Type(ListStringJsonType.class)
    @Builder.Default
    private List<String> screenshots = new ArrayList<>();

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onPersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
