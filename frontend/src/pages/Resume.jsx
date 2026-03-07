import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Pencil, X, Upload } from 'lucide-react'
import { contentService } from '../services/contentService'
import { useAppStore } from '../store/useAppStore'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { adminApi } from '../api/adminApi'
import ResumeViewer from '../components/ResumeViewer/ResumeViewer'

const inputClass = 'w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none'
const labelClass = 'block text-xs text-gray-500 font-orbitron mb-1'

export default function Resume() {
  const isAdmin = useIsAdmin()
  const refetchBootstrap = useAppStore((s) => s.refetchBootstrap)
  const [editing, setEditing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({ viewUrl: '', downloadUrl: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const openEdit = (current) => {
    setForm({ viewUrl: current?.viewUrl ?? '', downloadUrl: current?.downloadUrl ?? '' })
    setError('')
    setEditing(true)
  }

  const handleEditClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const resume = useAppStore.getState().bootstrapData?.resume
    openEdit(resume)
    if (resume == null) {
      contentService.getResume().then((data) => data && setForm({ viewUrl: data.viewUrl ?? '', downloadUrl: data.downloadUrl ?? '' })).catch(() => {})
    }
  }

  const saveEdit = async () => {
    setSaving(true)
    setError('')
    try {
      await adminApi.updateResume({ viewUrl: form.viewUrl.trim(), downloadUrl: form.downloadUrl.trim() })
      try {
        await refetchBootstrap()
      } catch (_) {
        // Bootstrap failed; resume was still saved
      }
      setRefreshKey((k) => k + 1)
      setEditing(false)
    } catch (e) {
      setError(e?.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.')
      return
    }
    setUploading(true)
    setError('')
    if (import.meta.env.DEV) console.log("[Resume] starting upload", file.name)
    try {
      await adminApi.uploadResumeFile(file)
      if (import.meta.env.DEV) console.log("[Resume] upload success")
      try {
        await refetchBootstrap()
      } catch (_) {}
      setRefreshKey((k) => k + 1)
      setEditing(false)
    } catch (e) {
      if (import.meta.env.DEV) console.error("[Resume] upload failed", e?.message, e)
      setError(e?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8 pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10 flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-4">
            Resume
          </h1>
          <p className="text-gray-400 font-exo text-sm mb-6">View or download</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={handleEditClick}
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-sm hover:bg-accent/10"
          >
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>
      <ResumeViewer key={refreshKey} />
      {editing && createPortal(
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => !saving && setEditing(false)}
            aria-modal="true"
            role="dialog"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
            <motion.div
              className="relative rounded-xl border border-glass-border bg-panel-bg/98 backdrop-blur-md w-full max-w-md my-auto shrink-0"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="font-orbitron text-accent">Edit resume</span>
                <button type="button" onClick={() => !saving && setEditing(false)} className="p-1.5 rounded text-gray-400 hover:text-white" aria-label="Close"><X size={18} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-2">
                  <span className="font-orbitron text-xs text-accent uppercase tracking-wider">Upload from computer</span>
                  <p className="text-gray-400 text-xs">Upload a PDF to Cloudinary. The link will be saved automatically.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Choose PDF file"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || saving}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-sm hover:bg-accent/10 disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {uploading ? 'Uploading…' : 'Choose PDF'}
                  </button>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <span className="font-orbitron text-xs text-gray-500 uppercase tracking-wider">Or paste URLs</span>
                </div>
                <div>
                  <label className={labelClass}>View URL</label>
                  <input type="url" value={form.viewUrl} onChange={(e) => setForm((f) => ({ ...f, viewUrl: e.target.value }))} className={inputClass} placeholder="https://..." />
                </div>
                <div>
                  <label className={labelClass}>Download URL</label>
                  <input type="url" value={form.downloadUrl} onChange={(e) => setForm((f) => ({ ...f, downloadUrl: e.target.value }))} className={inputClass} placeholder="https://..." />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={saveEdit} disabled={saving || uploading} className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-orbitron text-sm hover:bg-accent/30 disabled:opacity-50">{saving ? 'Saving…' : 'Save URLs'}</button>
                  <button type="button" onClick={() => !saving && !uploading && setEditing(false)} className="px-4 py-2 rounded-lg border border-glass-border text-gray-400 font-orbitron text-sm hover:text-white">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
    </motion.div>
  )
}
