const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** Same base URL used by apiRequest (for uploads that use fetch + FormData). */
export function getApiBase() {
  return API_BASE ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');
}

function isNetworkError(message) {
  if (!message || typeof message !== 'string') return false
  const m = message.toLowerCase()
  return m === 'failed to fetch' || m.includes('network error') || m.includes('load failed')
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("admin_token");

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const base = getApiBase();
  const url = `${base}${path}`;

  if (import.meta.env.DEV) {
    console.log("[API]", options.method || "GET", url, {
      hasToken: !!token,
      isFormData: isFormData,
    });
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (e) {
    if (import.meta.env.DEV) console.error("[API] fetch failed", url, e);
    const msg = e?.message ?? 'Failed to fetch'
    if (isNetworkError(msg)) {
      const base = getApiBase()
      throw new Error(base
        ? `Cannot reach the backend at ${base}. Check that it is running and CORS allows this origin.`
        : 'Cannot reach the backend. Set VITE_API_BASE_URL in .env (or env) and ensure the backend is running.')
    }
    throw e
  }

  if (import.meta.env.DEV) {
    console.log("[API] response", response.status, response.statusText, url);
  }

  if (!response.ok) {
    const text = await response.text()
    if (import.meta.env.DEV) console.error("[API] error body", response.status, text)
    let message = text
    try {
      const json = JSON.parse(text)
      if (json.message) message = json.message
    } catch (_) {}
    if (response.status === 401) message = message || 'Invalid username or password'
    const err = new Error(message)
    err.status = response.status
    throw err
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
