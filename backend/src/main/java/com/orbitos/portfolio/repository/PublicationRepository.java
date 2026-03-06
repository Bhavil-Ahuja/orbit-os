package com.orbitos.portfolio.repository;

import com.orbitos.portfolio.entity.Publication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PublicationRepository extends JpaRepository<Publication, Long> {

    List<Publication> findAllByOrderBySortOrderAsc();
}
