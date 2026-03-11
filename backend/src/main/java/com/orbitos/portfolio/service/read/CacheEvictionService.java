package com.orbitos.portfolio.service.read;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

/**
 * Evicts read-model caches. Call from admin write operations to keep cache consistent.
 */
@Service
public class CacheEvictionService {

    @CacheEvict(value = "navigation", allEntries = true)
    public void evictNavigation() {
    }

    @CacheEvict(value = "portfolio", allEntries = true)
    public void evictPortfolio() {
    }

    @CacheEvict(value = "skillOrbits", allEntries = true)
    public void evictSkillOrbits() {
    }

    @CacheEvict(value = "resumeTerminal", allEntries = true)
    public void evictResumeTerminal() {
    }

    @CacheEvict(value = "systems", allEntries = true)
    public void evictSystems() {
    }

    @CacheEvict(value = "bootstrap", allEntries = true)
    public void evictBootstrap() {
    }
}
