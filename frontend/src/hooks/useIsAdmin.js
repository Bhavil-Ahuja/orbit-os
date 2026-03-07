import { useAppStore } from '../store/useAppStore'
import { ADMIN_TOKEN_KEY } from './useAdminAuthCheck'

/**
 * True when the user is considered admin: store says so OR token is in localStorage.
 * Use this to show Edit/Add/Delete UI so it appears even before whoami() completes
 * or if state was lost across navigation.
 */
export function useIsAdmin() {
  const adminAuthenticated = useAppStore((s) => s.adminAuthenticated)
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem(ADMIN_TOKEN_KEY)
  return adminAuthenticated || hasToken
}
