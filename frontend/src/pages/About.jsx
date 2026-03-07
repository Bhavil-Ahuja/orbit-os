import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Pencil, X } from 'lucide-react'
import Terminal from '../components/Terminal/Terminal'
import { contentService } from '../services/contentService'
import { useAppStore } from '../store/useAppStore'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { adminApi } from '../api/adminApi'
import { publicApi } from '../api/publicApi'

export default function About() {
  const [data, setData] = useState(null)
  const [displayText, setDisplayText] = useState('')
  const [done, setDone] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = useIsAdmin()
  const refetchBootstrap = useAppStore((s) => s.refetchBootstrap)

  useEffect(() => {
    contentService.getAbout().then((d) => setData(d ?? { content: '' }))
  }, [])

  useEffect(() => {
    if (!data?.content) return
    const full = data.content
    let i = 0
    const id = setInterval(() => {
      if (i >= full.length) {
        clearInterval(id)
        setDone(true)
        return
      }
      setDisplayText(full.slice(0, i + 1))
      i += 1
    }, 20)
    return () => clearInterval(id)
  }, [data?.content])

  const openEdit = () => {
    setEditContent(data?.content ?? '')
    setError('')
    setEditing(true)
  }

  const saveEdit = async () => {
    setSaving(true)
    setError('')
    try {
      await adminApi.updateAbout(editContent)
      let next
      try {
        await refetchBootstrap()
        next = await contentService.getAbout()
      } catch (_) {
        next = await publicApi.getAbout().catch(() => ({ content: editContent }))
      }
      setData(next ?? { content: editContent })
      setEditing(false)
    } catch (e) {
      setError(e?.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <h1 className="font-orbitron text-2xl md:text-3xl text-accent">
          About
        </h1>
        {isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              openEdit()
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-sm hover:bg-accent/10 transition-colors"
          >
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>
      <Terminal title="about_bhavil.txt" idle={done}>
        <pre className="font-space text-sm text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
          {displayText}
          {displayText.length > 0 && (
            <motion.span
              className="inline-block min-w-[0.5em]"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, ease: 'linear' }}
              aria-hidden
            >
              |
            </motion.span>
          )}
        </pre>
      </Terminal>

      {editing &&
        createPortal(
          <motion.div
            key="about-edit-modal"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && setEditing(false)}
            aria-modal="true"
            role="dialog"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
            <motion.div
              className="relative rounded-xl border border-glass-border bg-panel-bg/98 backdrop-blur-md w-full max-w-xl my-auto shrink-0"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="font-orbitron text-accent">Edit About</span>
                <button type="button" onClick={() => !saving && setEditing(false)} className="p-1.5 rounded text-gray-400 hover:text-white" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-48 px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none resize-y"
                  placeholder="About content..."
                />
                {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 mt-2">
                  <p className="text-red-400 text-sm font-medium">Request failed</p>
                  <p className="text-red-300/90 text-sm mt-0.5">{error}</p>
                </div>
              )}
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={saveEdit} disabled={saving} className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-orbitron text-sm hover:bg-accent/30 disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => !saving && setEditing(false)} className="px-4 py-2 rounded-lg border border-glass-border text-gray-400 font-orbitron text-sm hover:text-white">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
    </motion.div>
  )
}
