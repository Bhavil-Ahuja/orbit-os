import { apiRequest } from "./client";

export const adminApi = {
  // Auth
  login(username, password) {
    return apiRequest("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  whoami() {
    return apiRequest("/api/admin/whoami");
  },

  // About
  updateAbout(content) {
    return apiRequest("/api/admin/about", {
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
  },

  // Projects
  createProject(data) {
    return apiRequest("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProject(id, data) {
    return apiRequest(`/api/admin/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteProject(id) {
    return apiRequest(`/api/admin/projects/${id}`, {
      method: "DELETE",
    });
  },

  publishProject(id) {
    return apiRequest(`/api/admin/projects/${id}/publish`, {
      method: "POST",
    });
  },

  // Experience
  createExperience(data) {
    return apiRequest("/api/admin/experience", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateExperience(id, data) {
    return apiRequest(`/api/admin/experience/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteExperience(id) {
    return apiRequest(`/api/admin/experience/${id}`, {
      method: "DELETE",
    });
  },

  // Skills
  seedSkillCategories() {
    return apiRequest("/api/admin/skills/categories/seed", {
      method: "POST",
    });
  },

  createSkill(data) {
    return apiRequest("/api/admin/skills", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createSkillsBatch(data) {
    return apiRequest("/api/admin/skills/batch", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateSkill(id, data) {
    return apiRequest(`/api/admin/skills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteSkill(id) {
    return apiRequest(`/api/admin/skills/${id}`, {
      method: "DELETE",
    });
  },

  // Publications
  createPublication(data) {
    return apiRequest("/api/admin/publications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePublication(id, data) {
    return apiRequest(`/api/admin/publications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deletePublication(id) {
    return apiRequest(`/api/admin/publications/${id}`, {
      method: "DELETE",
    });
  },

  // Resume
  updateResume(data) {
    return apiRequest("/api/admin/resume", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Contact submissions (Stay in Touch)
  getContactSubmissions() {
    return apiRequest("/api/admin/contact-submissions");
  },

  /** Upload resume PDF to Cloudinary; backend stores URL in DB. */
  uploadResumeFile(file) {
    if (import.meta.env.DEV) {
      console.log("[Resume upload] file:", file?.name, file?.type, file?.size, "bytes");
    }
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest("/api/admin/upload-resume", {
      method: "POST",
      body: formData,
    });
  },
};
