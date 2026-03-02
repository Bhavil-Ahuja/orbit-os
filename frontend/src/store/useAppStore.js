import { create } from 'zustand'

export const useAppStore = create((set) => ({
  bootComplete: false,
  setBootComplete: (value) => set({ bootComplete: value }),

  currentRoute: '/',
  setCurrentRoute: (route) => set({ currentRoute: route }),

  isNavigating: false,
  setNavigating: (value) => set({ isNavigating: value }),

  // Admin (placeholder — no backend auth yet)
  adminAuthenticated: false,
  setAdminAuthenticated: (value) => set({ adminAuthenticated: value }),

  // Scroll console: which section is in view (about | experience | projects | publications | skills | resume | stay-in-touch)
  activeSection: 'about',
  setActiveSection: (id) => set({ activeSection: id }),

  // True for ~300ms after section change; drives starfield/camera environmental reaction
  sectionTransitioning: false,
  setSectionTransitioning: (value) => set({ sectionTransitioning: value }),

  // Landing boot sequence: dim + pause starfield until Access Granted
  bootInProgress: true,
  setBootInProgress: (value) => set({ bootInProgress: value }),
}))
