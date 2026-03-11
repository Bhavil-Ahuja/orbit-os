import { create } from 'zustand'
import { publicApi } from '../api/publicApi'

export const useAppStore = create((set, get) => ({
  bootComplete: false,
  setBootComplete: (value) => set({ bootComplete: value }),

  // Single bootstrap load: navigation, portfolio, skillsOrbit, resume, resumeTerminal
  bootstrapData: null,
  bootstrapLoading: false,
  bootstrapError: null,
  setBootstrapData: (data) => set({ bootstrapData: data, bootstrapLoading: false, bootstrapError: null }),
  setBootstrapLoading: (value) => set({ bootstrapLoading: value }),
  setBootstrapError: (err) => set({ bootstrapError: err, bootstrapLoading: false }),
  /**
   * @param {boolean} [skipIfMock] - When true (mock mode), no API call. Prevents dev tools showing requests.
   */
  loadBootstrap: async (skipIfMock = false) => {
    if (skipIfMock) return
    if (get().bootstrapData || get().bootstrapLoading) return
    set({ bootstrapLoading: true, bootstrapError: null })
    try {
      const data = await publicApi.getBootstrap()
      set({ bootstrapData: data ?? null, bootstrapLoading: false, bootstrapError: null })
    } catch (e) {
      set({ bootstrapData: null, bootstrapLoading: false, bootstrapError: e?.message ?? 'Failed to load' })
    }
  },
  /** Force refetch bootstrap (e.g. after admin edit). Keeps current data visible so scroll position is not lost. */
  refetchBootstrap: async () => {
    set({ bootstrapLoading: true, bootstrapError: null })
    try {
      const data = await publicApi.getBootstrap()
      set({ bootstrapData: data ?? null, bootstrapLoading: false, bootstrapError: null })
    } catch (e) {
      set({ bootstrapLoading: false, bootstrapError: e?.message ?? 'Failed to load' })
    }
  },

  currentRoute: '/',
  setCurrentRoute: (route) => set({ currentRoute: route }),

  isNavigating: false,
  setNavigating: (value) => set({ isNavigating: value }),

  // Admin: true after successful login; restored on load via whoami when admin_token in localStorage
  adminAuthenticated: false,
  setAdminAuthenticated: (value) => set({ adminAuthenticated: value }),

  // Scroll console: which section is in view (about | systems | experience | projects | publications | skills | resume | stay-in-touch)
  activeSection: 'about',
  setActiveSection: (id) => set({ activeSection: id }),

  // True for ~300ms after section change; drives starfield/camera environmental reaction
  sectionTransitioning: false,
  setSectionTransitioning: (value) => set({ sectionTransitioning: value }),

  // Landing boot sequence: dim + pause starfield until Access Granted
  bootInProgress: true,
  setBootInProgress: (value) => set({ bootInProgress: value }),
}))
