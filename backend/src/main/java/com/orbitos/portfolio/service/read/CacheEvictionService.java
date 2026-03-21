package com.orbitos.portfolio.service.read;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

/**
 * Evicts read-model caches. Call from admin write operations to keep cache consistent.
 * {@link #evictPortfolio()}, {@link #evictNavigation()}, {@link #evictResumeTerminal()},
 * {@link #evictSkillOrbits()}, and {@link #evictSystems()} also evict {@code bootstrap} (bootstrap embeds those slices).
 */
@Service
public class CacheEvictionService {

    @CacheEvict(cacheNames = { "navigation", "bootstrap" }, allEntries = true)
    public void evictNavigation() {
    }

    @CacheEvict(cacheNames = { "portfolio", "bootstrap" }, allEntries = true)
    public void evictPortfolio() {
    }

    @CacheEvict(cacheNames = { "skillOrbits", "bootstrap" }, allEntries = true)
    public void evictSkillOrbits() {
    }

    @CacheEvict(cacheNames = { "resumeTerminal", "bootstrap" }, allEntries = true)
    public void evictResumeTerminal() {
    }

    @CacheEvict(cacheNames = { "systems", "bootstrap" }, allEntries = true)
    public void evictSystems() {
    }

    @CacheEvict(value = "bootstrap", allEntries = true)
    public void evictBootstrap() {
    }
}
