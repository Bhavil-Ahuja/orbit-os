package com.orbitos.portfolio.repository;

import com.orbitos.portfolio.entity.ContactSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactSubmissionRepository extends JpaRepository<ContactSubmission, Long> {

    List<ContactSubmission> findAllByOrderByCreatedAtDesc();
}
