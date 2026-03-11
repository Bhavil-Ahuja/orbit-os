import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useMouseTilt } from '../hooks/useMouseTilt'
import { useAppStore } from '../store/useAppStore'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { adminApi } from '../api/adminApi'
import SortableList from '../components/SortableList/SortableList'

export default function Systems() {
  const [loaded, setLoaded] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState(null)
  const [formModal, setFormModal] = useState(null) // null | 'add' | system (edit)
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.1 })
  const isAdmin = useIsAdmin()
  const refetchBootstrap = useAppStore((s) => s.refetchBootstrap)
  const activeSection = useAppStore((s) => s.activeSection)
  const isSystemsActive = activeSection === 'systems'
  const systems = useAppStore((s) => s.bootstrapData?.systems) ?? []

  const refreshSystems = async () => {
    try {
      await refetchBootstrap()
    } catch (_) {
      // Store keeps previous data
    }
  }

  useEffect(() => {
    if (!isSystemsActive) return
    const t = setTimeout(() => setLoaded(true), 1400)
    return () => clearTimeout(t)
  }, [isSystemsActive])

  const handleDelete = async (item) => {
    if (!isAdmin || !window.confirm(`Delete "${item.title}"?`)) return
    try {
      await adminApi.deleteSystemCategory(item.id)
      await refreshSystems()
      if (selectedSystem?.id === item.id) setSelectedSystem(null)
    } catch (e) {
      window.alert(e?.message ?? 'Delete failed')
    }
  }

  return (
    <motion.div
      ref={sectionRef}
      className={`relative max-w-6xl mx-auto px-6 py-8 ${!loaded ? 'min-h-[min(100vh,900px)]' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute inset-0 -mx-4 -my-4 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0, 212, 255, 0.045) 0%, transparent 70%)',
          boxShadow: 'inset 0 0 60px rgba(0, 212, 255, 0.02)',
        }}
        aria-hidden
      />

      <AnimatePresence>
        {isSystemsActive && !loaded && (
          <motion.div
            key="loading-systems"
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none min-h-[200px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="font-space text-accent/90 text-sm flex items-center gap-2">
              <span className="text-green-500/80">&gt;</span>
              Loading Systems...
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                _
              </motion.span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {(inView || isSystemsActive) && loaded && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden z-[1]"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 2, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}
          />
        </motion.div>
      )}

      <div className="relative">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-2" style={{ textShadow: 'none' }}>
              Systems I Build
            </h1>
            <p className="text-gray-400 font-exo text-base mb-6">
              Core engineering domains I design and build systems in.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setFormModal('add')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-sm hover:bg-accent/10 shrink-0"
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        <SortableList
          items={systems}
          getId={(s) => s.id}
          onReorder={async (orderedIds) => {
            await adminApi.reorderSystemCategories(orderedIds)
            await refreshSystems()
          }}
          isAdmin={isAdmin}
          layout="grid"
        >
          {(item, index) => (
            <SystemCard
              key={item.id}
              item={item}
              index={index}
              inView={(inView || isSystemsActive) && loaded}
              isAdmin={isAdmin}
              onSelect={setSelectedSystem}
              onEdit={() => setFormModal(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
        </SortableList>
      </div>

      <AnimatePresence>
        {selectedSystem ? (
          <SystemDetailModal
            key="system-detail"
            system={selectedSystem}
            onClose={() => setSelectedSystem(null)}
            isAdmin={isAdmin}
            onEdit={() => { setSelectedSystem(null); setFormModal(selectedSystem) }}
            onDelete={() => handleDelete(selectedSystem)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {formModal && (
          <SystemFormModal
            system={formModal === 'add' ? null : formModal}
            onClose={() => setFormModal(null)}
            onSaved={async () => {
              await refreshSystems()
              setFormModal(null)
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SystemCard({ item, index, inView, isAdmin, onSelect, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const { ref: tiltRef, style: tiltStyle, mousePos, handleMouseMove, handleMouseLeave } = useMouseTilt({
    maxTilt: 6,
    perspective: 1000,
  })
  const bullets = Array.isArray(item.bulletPoints) ? item.bulletPoints : []

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeaveCard = () => {
    setHovered(false)
    handleMouseLeave()
  }

  const handleCardClick = () => onSelect?.(item)

  return (
    <motion.div
      ref={tiltRef}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleCardClick : undefined}
      onKeyDown={onSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } } : undefined}
      className={`relative rounded-2xl overflow-visible h-full ${onSelect ? 'cursor-pointer' : ''}`}
      style={tiltStyle}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { delay: 0.2 + index * 0.1, duration: 0.45, ease: [0.22, 0.61, 0.36, 1] },
            }
          : {}
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeaveCard}
    >
      <motion.div
        className="relative rounded-2xl border border-glass-border bg-panel-bg/95 backdrop-blur-md overflow-hidden h-full flex flex-col"
        animate={{
          y: hovered ? -4 : 0,
          borderColor: hovered ? 'rgba(0, 212, 255, 0.25)' : 'rgba(255,255,255,0.07)',
          boxShadow: hovered
            ? '0 0 0 1px rgba(0, 212, 255, 0.2), 0 20px 40px -12px rgba(0, 0, 0, 0.4)'
            : '0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px -12px rgba(0, 0, 0, 0.4)',
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 70%, rgba(0,212,255,0.02) 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-[250ms]"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)`,
          }}
          aria-hidden
        />

        <div className="relative p-5 md:p-6 flex flex-col flex-1 min-h-0">
          <h3 className="font-orbitron text-lg md:text-xl text-accent mb-1.5 flex-shrink-0" style={{ textShadow: 'none' }}>
            {item.title}
          </h3>
          {item.description && (
            <p className="text-gray-300 font-exo text-sm leading-relaxed mb-3 opacity-90">{item.description}</p>
          )}
          {bullets.length > 0 && (
            <ul className="font-exo text-sm leading-relaxed space-y-0.5 list-none flex-1 min-h-0">
              {bullets.map((line, j) => (
                <li key={j} className="flex gap-2 text-gray-200">
                  <span className="text-accent/90 shrink-0">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-accent font-exo text-sm"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="inline-flex items-center gap-1.5 text-red-400/80 hover:text-red-400 font-exo text-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function SystemDetailModal({ system, onClose, isAdmin, onEdit, onDelete }) {
  useEffect(() => {
    if (!system) return
    const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [system, onClose])

  if (!system) return null

  const bullets = Array.isArray(system.bulletPoints) ? system.bulletPoints : []

  const modal = (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="system-detail-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
      <motion.div
        className="relative rounded-2xl border border-white/10 bg-black/90 backdrop-blur-md w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col my-auto shrink-0"
        style={{ boxShadow: '0 0 0 1px rgba(0,212,255,0.15), 0 24px 48px -12px rgba(0,0,0,0.5)' }}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-white/10 flex-shrink-0 flex-wrap">
          <h2 id="system-detail-title" className="font-orbitron text-xl text-accent" style={{ textShadow: 'none' }}>
            {system.title}
          </h2>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <>
                <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-xs hover:bg-accent/10">
                  <Pencil size={12} /> Edit
                </button>
                <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-400/90 font-orbitron text-xs hover:bg-red-500/10">
                  <Trash2 size={12} /> Delete
                </button>
              </>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {system.description && (
            <p className="font-exo text-gray-200 text-sm leading-relaxed">{system.description}</p>
          )}
          {bullets.length > 0 && (
            <ul className="font-exo text-sm leading-relaxed space-y-1.5 list-none">
              {bullets.map((line, j) => (
                <li key={j} className="flex gap-2 text-gray-200">
                  <span className="text-accent/90 shrink-0">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
  return createPortal(modal, document.body)
}

function slugify(str) {
  if (!str || typeof str !== 'string') return ''
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function SystemFormModal({ system, onClose, onSaved }) {
  const isEdit = system != null
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => ({
    slug: system?.slug ?? '',
    title: system?.title ?? '',
    description: system?.description ?? '',
    bulletPoints: Array.isArray(system?.bulletPoints) ? [...system.bulletPoints] : [''],
  }))

  const addBullet = () =>
    setForm((f) => {
      const list = f.bulletPoints || []
      if (list.length >= 6) return f
      return { ...f, bulletPoints: [...list, ''] }
    })
  const removeBullet = (i) =>
    setForm((f) => ({
      ...f,
      bulletPoints: f.bulletPoints.filter((_, j) => j !== i),
    }))
  const setBullet = (i, value) =>
    setForm((f) => ({
      ...f,
      bulletPoints: f.bulletPoints.map((b, j) => (j === i ? value : b)),
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const bulletPoints = (form.bulletPoints || []).map((s) => s.trim()).filter(Boolean)
      if (bulletPoints.length === 0) {
        setError('At least one bullet point is required.')
        setSaving(false)
        return
      }
      if (bulletPoints.length > 6) {
        setError('Maximum 6 bullet points allowed.')
        setSaving(false)
        return
      }
      const slug = form.slug?.trim() ? slugify(form.slug) : (isEdit ? undefined : slugify(form.title))
      if (!isEdit && !slug) {
        setError('Slug is required (e.g. ai-document-assistants).')
        setSaving(false)
        return
      }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        bulletPoints,
      }
      if (!isEdit) payload.slug = slug
      else if (slug != null) payload.slug = slug
      if (isEdit) {
        await adminApi.updateSystemCategory(system.id, payload)
      } else {
        await adminApi.createSystemCategory(payload)
      }
      await onSaved()
    } catch (e) {
      setError(e?.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const modal = (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !saving && onClose()}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
      <motion.div
        className="relative rounded-xl border border-glass-border bg-panel-bg/98 backdrop-blur-md w-full max-w-lg max-h-[90vh] flex flex-col my-auto shrink-0"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 bg-panel-bg/98">
          <span className="font-orbitron text-accent">{isEdit ? 'Edit system category' : 'Add system category'}</span>
          <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded text-gray-400 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto min-h-0 flex-1">
          <div>
            <label className="block text-xs text-gray-500 font-orbitron mb-1">Title (required)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onBlur={() => {
                if (!isEdit && !form.slug?.trim()) setForm((f) => ({ ...f, slug: slugify(f.title) }))
              }}
              className="w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-orbitron mb-1">Slug (URL-friendly, e.g. ai-document-assistants)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder={slugify(form.title) || 'e.g. full-stack-platforms'}
              className="w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-orbitron mb-1">Description (required)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none resize-y"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-gray-500 font-orbitron">Bullet points (1–6)</label>
              <button
                type="button"
                onClick={addBullet}
                disabled={(form.bulletPoints || []).length >= 6}
                className="text-xs text-accent hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-2">One line per bullet. Min 1, max 6.</p>
            <div className="space-y-2">
              {(form.bulletPoints || ['']).map((bullet, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => setBullet(i, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none"
                    placeholder={`Bullet ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeBullet(i)}
                    className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    aria-label="Remove bullet"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2">
              <p className="text-red-400 text-sm font-medium">Request failed</p>
              <p className="text-red-300/90 text-sm mt-0.5">{error}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-orbitron text-sm hover:bg-accent/30 disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-glass-border text-gray-400 font-orbitron text-sm hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
  return createPortal(modal, document.body)
}
