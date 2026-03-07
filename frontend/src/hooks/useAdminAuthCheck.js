import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { adminApi } from "../api/adminApi";

const ADMIN_TOKEN_KEY = "admin_token";

/**
 * Runs once on mount: if admin_token exists in localStorage, calls /api/admin/whoami.
 * On success → setAdminAuthenticated(true).
 * On failure → setAdminAuthenticated(false). Only clear token on 401/403 (auth rejected);
 * do not clear on network error or other failures so the token survives a reload when
 * the backend is temporarily unavailable.
 */
export function useAdminAuthCheck() {
  const setAdminAuthenticated = useAppStore((s) => s.setAdminAuthenticated);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      setAdminAuthenticated(false);
      return;
    }
    adminApi
      .whoami()
      .then(() => setAdminAuthenticated(true))
      .catch((err) => {
        const status = err?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
        }
        setAdminAuthenticated(false);
      });
  }, [setAdminAuthenticated]);
}

export { ADMIN_TOKEN_KEY };
