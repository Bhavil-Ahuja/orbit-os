import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { adminApi } from '../api/adminApi'
import { ADMIN_TOKEN_KEY } from '../hooks/useAdminAuthCheck'

function formatMessageTime(isoString) {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return isoString
  }
}

export default function WhoAmI() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const setAdminAuthenticated = useAppStore((s) => s.setAdminAuthenticated)
  const adminAuthenticated = useAppStore((s) => s.adminAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (!adminAuthenticated) return
    setMessagesLoading(true)
    adminApi
      .getContactSubmissions()
      .then((res) => setMessages(Array.isArray(res) ? res : []))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false))
  }, [adminAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminApi.login(username, password)
      localStorage.setItem(ADMIN_TOKEN_KEY, res.token)
      setAdminAuthenticated(true)
    } catch (err) {
      setError(err.message || 'Login failed')
      setAdminAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setAdminAuthenticated(false)
  }

  if (adminAuthenticated) {
    return (
      <motion.div
        className="max-w-4xl mx-auto px-6 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="font-orbitron text-2xl text-accent mb-6">Admin Dashboard</h1>
        <p className="text-gray-400 font-exo mb-4">
          Admin mode is enabled. You can edit content, add/delete projects, and update the portfolio from the main app.
        </p>
        <p className="text-gray-500 font-space text-sm mb-6">
          Edit buttons, add project, delete project, and update content are available when admin mode is on.
        </p>

        <section className="mb-8">
          <h2 className="font-orbitron text-accent text-lg mb-3">Stay in Touch — Messages</h2>
          {messagesLoading ? (
            <p className="text-gray-500 font-space text-sm">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 font-space text-sm">No messages yet.</p>
          ) : (
            <ul className="space-y-4">
              {(Array.isArray(messages) ? messages : []).map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-white/10 bg-black/30 p-4 font-exo text-sm"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <span className="font-orbitron text-accent">{m.name}</span>
                    <span className="text-gray-500">{m.email}</span>
                    <time className="text-gray-500 font-space text-xs" dateTime={m.createdAt}>
                      {formatMessageTime(m.createdAt)}
                    </time>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg border border-glass-border text-gray-400 font-orbitron text-sm hover:text-white hover:border-red-500/50"
        >
          Log out
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-glass-border bg-panel-bg/90 backdrop-blur-md p-8 shadow-panel"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <h2 className="font-orbitron text-accent text-lg mb-2">Admin</h2>
        <p className="text-gray-500 font-space text-xs mb-6">
          Sign in to enable edit buttons and content management. Dev default: admin / password.
        </p>
        <div className="mb-4">
          <label htmlFor="admin-username" className="block text-xs text-gray-500 font-orbitron mb-2">
            Username
          </label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none"
            placeholder="admin"
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="admin-password" className="block text-xs text-gray-500 font-orbitron mb-2">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none"
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="text-red-400/80 text-xs mb-4">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-accent/20 border border-accent/50 text-accent font-orbitron text-sm hover:bg-accent/30 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-glass-border text-gray-400 font-orbitron text-sm hover:text-white"
          >
            Back
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}
