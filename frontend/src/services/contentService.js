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
import { useAppStore } from '../store/useAppStore'

export const useMock = import.meta.env.VITE_USE_MOCK === 'true' // Set VITE_USE_MOCK=true in .env to use mock data

// Memory cache: avoid refetch when navigating; fromBootstrap keeps it in sync with store
let bootstrapCache = null

function fromBootstrap(path) {
  const data = useAppStore.getState().bootstrapData
  if (data) bootstrapCache = data
  const d = data ?? bootstrapCache
  if (!d) return undefined
  const parts = path.split('.')
  let v = d
  for (const p of parts) {
    v = v?.[p]
  }
  return v
}

export function getBootstrapCache() {
  return bootstrapCache ?? useAppStore.getState().bootstrapData
}

export const contentService = {
  async getAbout() {
    if (useMock) return Promise.resolve(mockAbout)
    const data = fromBootstrap('portfolio.about')
    return Promise.resolve(data ?? { content: '' })
  },

  async getExperience() {
    if (useMock) return Promise.resolve(mockExperience)
    const data = fromBootstrap('portfolio.experience')
    return Promise.resolve(Array.isArray(data) ? data : [])
  },

  async getProjects() {
    if (useMock) return Promise.resolve(mockProjects)
    const data = fromBootstrap('portfolio.projects')
    return Promise.resolve(Array.isArray(data) ? data : [])
  },

  async getPublications() {
    if (useMock) return Promise.resolve(mockPublications)
    const data = fromBootstrap('portfolio.publications')
    return Promise.resolve(Array.isArray(data) ? data : [])
  },

  async getSystems() {
    if (useMock) return Promise.resolve([])
    const data = fromBootstrap('systems')
    return Promise.resolve(Array.isArray(data) ? data : [])
  },

  async getSkills() {
    if (useMock) return Promise.resolve(mockSkills)
    const data = fromBootstrap('portfolio.skills')
    return Promise.resolve(Array.isArray(data) ? data : [])
  },

  async getResume() {
    if (useMock) return Promise.resolve(mockResume)
    const data = fromBootstrap('resume')
    return Promise.resolve(data ?? null)
  },

  async getLanding() {
    if (useMock) return Promise.resolve(mockLanding)
    const { data } = await api.get('/landing')
    return data
  },

  /** Bootstrap-only: skills orbit and resume terminal from single load (for Skills/Resume when not useMock). */
  getSkillsOrbitFromBootstrap() {
    return fromBootstrap('skillsOrbit')
  },
  getResumeTerminalFromBootstrap() {
    return fromBootstrap('resumeTerminal')
  },
}
