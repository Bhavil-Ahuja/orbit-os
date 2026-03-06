package com.orbitos.portfolio.repository;

import com.orbitos.portfolio.entity.About;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface AboutRepository extends JpaRepository<About, Long> {

    /**
     * Singleton: about table has exactly one row.
     */
    Optional<About> findFirstByOrderByIdAsc();

    @Modifying
    @Query("UPDATE About a SET a.content = :content, a.updatedAt = :updatedAt WHERE a.id = :id")
    void updateContent(@Param("id") Long id, @Param("content") String content, @Param("updatedAt") Instant updatedAt);
}
