package com.orbitos.portfolio.repository;

import com.orbitos.portfolio.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    Optional<Resume> findFirstByOrderByIdAsc();
}
