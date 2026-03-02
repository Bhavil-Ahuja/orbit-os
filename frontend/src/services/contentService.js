import api from './api'
import {
  mockAbout,
  mockExperience,
  mockProjects,
  mockPublications,
  mockSkills,
  mockResume,
  mockLanding,
} from './mockData'

const useMock = true // Toggle when real API is ready

export const contentService = {
  async getAbout() {
    if (useMock) return Promise.resolve(mockAbout)
    const { data } = await api.get('/about')
    return data
  },

  async getExperience() {
    if (useMock) return Promise.resolve(mockExperience)
    const { data } = await api.get('/experience')
    return data
  },

  async getProjects() {
    if (useMock) return Promise.resolve(mockProjects)
    const { data } = await api.get('/projects')
    return data
  },

  async getPublications() {
    if (useMock) return Promise.resolve(mockPublications)
    const { data } = await api.get('/publications')
    return data
  },

  async getSkills() {
    if (useMock) return Promise.resolve(mockSkills)
    const { data } = await api.get('/skills')
    return data
  },

  async getResume() {
    if (useMock) return Promise.resolve(mockResume)
    const { data } = await api.get('/resume')
    return data
  },

  async getLanding() {
    if (useMock) return Promise.resolve(mockLanding)
    const { data } = await api.get('/landing')
    return data
  },
}
