package com.orbitos.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactSubmissionDto {

    private Long id;
    private String name;
    private String email;
    private String message;
    private Instant createdAt;
}
