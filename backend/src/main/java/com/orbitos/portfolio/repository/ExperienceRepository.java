package com.orbitos.portfolio.repository;

import com.orbitos.portfolio.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {

    @Query("SELECT e FROM Experience e ORDER BY CASE WHEN e.status = 'ACTIVE' THEN 0 ELSE 1 END ASC, e.sortOrder ASC")
    List<Experience> findAllActiveFirstThenBySortOrder();
}
