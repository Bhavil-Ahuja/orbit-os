package com.orbitos.portfolio.repository;

import com.orbitos.portfolio.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    @Query("SELECT s FROM Skill s JOIN FETCH s.category c ORDER BY c.sortOrder, s.sortOrder")
    List<Skill> findAllOrdered();
}
