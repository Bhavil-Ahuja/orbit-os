import { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { contentService } from '../../services/contentService'

/**
 * Handles bootstrap API state only. When mock: no API call, render children.
 * When real API: load once, show loading/error until data ready, then render children.
 * Console and other pages only care about rendering; they read from store/contentService.
 */
export default function BootstrapLoader({ children }) {
  const loadBootstrap = useAppStore((state) => state.loadBootstrap)
  const bootstrapData = useAppStore((state) => state.bootstrapData)
  const bootstrapLoading = useAppStore((state) => state.bootstrapLoading)
  const bootstrapError = useAppStore((state) => state.bootstrapError)

  const useMock = contentService.useMock

  useEffect(() => {
    loadBootstrap(useMock)
  }, [loadBootstrap, useMock])

  if (useMock) return children

  if (bootstrapLoading && !bootstrapData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="font-orbitron text-sm text-gray-400">Loading...</span>
        </div>
      </div>
    )
  }

  if (bootstrapError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <span className="font-orbitron text-accent">Connection failed</span>
          <p className="text-gray-400 text-sm">{bootstrapError}</p>
        </div>
      </div>
    )
  }

  return children
}
