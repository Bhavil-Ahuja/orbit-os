import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export default function WhoAmI() {
  const [password, setPassword] = useState('')
  const [attempted, setAttempted] = useState(false)
  const setAdminAuthenticated = useAppStore((s) => s.setAdminAuthenticated)
  const adminAuthenticated = useAppStore((s) => s.adminAuthenticated)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setAttempted(true)
    // Placeholder: no backend auth. Accept any non-empty for demo.
    if (password.trim()) {
      setAdminAuthenticated(true)
    }
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
          Protected route structure ready. Backend auth not implemented yet.
        </p>
        <p className="text-gray-500 font-space text-sm">
          This area will allow editing portfolio content (about, projects, experience, etc.) once the CMS is built.
        </p>
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
          Authentication placeholder. No backend yet.
        </p>
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
          {attempted && !password.trim() && (
            <p className="text-red-400/80 text-xs mt-1">Required</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg bg-accent/20 border border-accent/50 text-accent font-orbitron text-sm hover:bg-accent/30"
          >
            Unlock
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
