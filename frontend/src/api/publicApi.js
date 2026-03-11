import { apiRequest } from "./client";

export const publicApi = {
  getPortfolio() {
    return apiRequest("/api/public/portfolio");
  },

  getNavigation() {
    return apiRequest("/api/public/navigation");
  },

  getProjects(preview = false) {
    const query = preview ? "?preview=true" : "";
    return apiRequest(`/api/public/projects${query}`);
  },

  getProjectBySlug(slug, preview = false) {
    const query = preview ? "?preview=true" : "";
    return apiRequest(`/api/public/projects/${encodeURIComponent(slug)}${query}`);
  },

  getBootstrap() {
    return apiRequest("/api/public/bootstrap");
  },

  getAbout() {
    return apiRequest("/api/public/about");
  },

  getExperience() {
    return apiRequest("/api/public/experience");
  },

  getSkills() {
    return apiRequest("/api/public/skills");
  },

  getSkillCategories() {
    return apiRequest("/api/public/skills/categories");
  },

  getSkillsOrbits() {
    return apiRequest("/api/public/skills/orbits");
  },

  getPublications() {
    return apiRequest("/api/public/publications");
  },

  getSystems() {
    return apiRequest("/api/public/systems");
  },

  getResume() {
    return apiRequest("/api/public/resume");
  },

  getResumeTerminal() {
    return apiRequest("/api/public/resume/terminal");
  },

  getSocialLinks() {
    return apiRequest("/api/public/social-links");
  },

  getHealth() {
    return apiRequest("/api/public/health");
  },

  /** Submit contact form (Stay in Touch). No auth. */
  submitContact({ name, email, message }) {
    return apiRequest("/api/public/contact", {
      method: "POST",
      body: JSON.stringify({ name, email, message }),
    });
  },
};
