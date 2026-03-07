package com.orbitos.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Singleton about (profile/bio). One row in DB. Updated by admin PATCH.
 */
@Entity
@Table(name = "about")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class About {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "text")
    @Builder.Default
    private String content = "";

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
