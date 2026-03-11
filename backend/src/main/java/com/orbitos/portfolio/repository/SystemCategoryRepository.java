package com.orbitos.portfolio.repository;

import com.orbitos.portfolio.entity.SystemCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SystemCategoryRepository extends JpaRepository<SystemCategory, Long> {

    List<SystemCategory> findAllByOrderBySortOrderAsc();

    Optional<SystemCategory> findTopByOrderBySortOrderDesc();

    Optional<SystemCategory> findBySlug(String slug);
}
