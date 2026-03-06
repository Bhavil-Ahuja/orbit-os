package com.orbitos.portfolio.entity;

import com.orbitos.portfolio.converter.JsonStringType;
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
import org.hibernate.annotations.Type;

import java.time.Instant;

@Entity
@Table(name = "resume")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "view_url", nullable = false, length = 512)
    @Builder.Default
    private String viewUrl = "";

    @Column(name = "download_url", nullable = false, length = 512)
    @Builder.Default
    private String downloadUrl = "";

    @Column(name = "terminal_data")
    @Type(JsonStringType.class)
    private String terminalData;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

