import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import Console from './Console'

/**
 * /explore — Main app (About, Experience, Projects, etc.).
 * Ensures bootComplete so nav and content show; supports direct visits to /explore.
 */
export default function ExploreRoute() {
  const setBootComplete = useAppStore((s) => s.setBootComplete)

  useEffect(() => {
    setBootComplete(true)
  }, [setBootComplete])

  return <Console />
}
