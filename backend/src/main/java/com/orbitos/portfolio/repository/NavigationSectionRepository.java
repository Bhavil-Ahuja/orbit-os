package com.orbitos.portfolio.repository;

import com.orbitos.portfolio.entity.NavigationSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NavigationSectionRepository extends JpaRepository<NavigationSection, Long> {

    List<NavigationSection> findAllByVisibleTrueOrderBySortOrderAsc();
}
