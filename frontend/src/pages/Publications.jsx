import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ExternalLink, Plus, Pencil, Trash2, X } from 'lucide-react'
import { contentService } from '../services/contentService'
import { useMouseTilt } from '../hooks/useMouseTilt'
import { useAppStore } from '../store/useAppStore'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { adminApi } from '../api/adminApi'
import { publicApi } from '../api/publicApi'
import PublicationDetailModal from '../components/PublicationDetailModal/PublicationDetailModal'

const CARD_SPRING = { type: 'spring', stiffness: 360, damping: 28 }
const CARD_HOVER_LIFT_PX = -4
const CARD_HOVER_SCALE = 1.02

export default function Publications() {
  const [publications, setPublications] = useState([])
  const [archiveLoaded, setArchiveLoaded] = useState(false)
  const [selectedPublication, setSelectedPublication] = useState(null)
  const [pubForm, setPubForm] = useState(null) // null | 'add' | publication (edit)
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.2 })
  const isAdmin = useIsAdmin()
  const refetchBootstrap = useAppStore((s) => s.refetchBootstrap)

  const refreshPublications = async () => {
    try {
      await refetchBootstrap()
      const next = await publicApi.getPublications()
      setPublications(Array.isArray(next) ? next : [])
    } catch (_) {
      const next = await contentService.getPublications().then((d) => d ?? []).catch(() => [])
      setPublications(Array.isArray(next) ? next : [])
    }
  }

  useEffect(() => {
    contentService.getPublications().then((next) => setPublications(Array.isArray(next) ? next : []))
  }, [])

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setArchiveLoaded(true), 1400)
    return () => clearTimeout(t)
  }, [inView])

  const handleDelete = async (pub) => {
    if (!isAdmin || !window.confirm(`Delete "${pub.title}"?`)) return
    try {
      await adminApi.deletePublication(pub.id)
      await refreshPublications()
      if (selectedPublication?.id === pub.id) setSelectedPublication(null)
    } catch (e) {
      window.alert(e?.message ?? 'Delete failed')
    }
  }

  return (
    <motion.div
      ref={sectionRef}
      className={`relative max-w-4xl mx-auto px-6 py-8 ${!archiveLoaded ? 'min-h-[min(100vh,900px)]' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Ambient glow — box merged with bg (same as Projects) */}
      <div
        className="absolute inset-0 -mx-4 -my-4 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0, 212, 255, 0.045) 0%, transparent 70%)',
          boxShadow: 'inset 0 0 60px rgba(0, 212, 255, 0.02)',
        }}
        aria-hidden
      />

      <AnimatePresence>
        {inView && !archiveLoaded && (
          <motion.div
            key="loading-archive"
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="font-space text-accent/90 text-sm flex items-center gap-2">
              <span className="text-green-500/80">&gt;</span>
              Loading Research Archive...
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

      {inView && archiveLoaded && (
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
              Publications
            </h1>
            <p className="text-gray-400 font-exo text-base mb-6">
              Research and written work
            </p>
          </div>
          {isAdmin && (
            <button type="button" onClick={() => setPubForm('add')} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-sm hover:bg-accent/10 shrink-0">
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        <div className="grid gap-4 grid-cols-1 w-full">
          {publications.map((pub, i) => (
            <PublicationCard
              key={pub.id}
              publication={pub}
              index={i}
              inView={inView && archiveLoaded}
              onSelect={setSelectedPublication}
              isAdmin={isAdmin}
              onEdit={() => setPubForm(pub)}
              onDelete={() => handleDelete(pub)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPublication ? (
          <PublicationDetailModal
            key="publication-detail"
            publication={selectedPublication}
            onClose={() => setSelectedPublication(null)}
            isAdmin={isAdmin}
            onEdit={() => { setSelectedPublication(null); setPubForm(selectedPublication) }}
            onDelete={() => handleDelete(selectedPublication)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {pubForm && (
          <PublicationFormModal
            publication={pubForm === 'add' ? null : pubForm}
            onClose={() => setPubForm(null)}
            onSaved={async () => { await refreshPublications(); setPubForm(null) }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PublicationCard({ publication, index, inView, onSelect, isAdmin, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const { ref: tiltRef, style: tiltStyle, mousePos, handleMouseMove, handleMouseLeave } = useMouseTilt({
    maxTilt: 6,
    perspective: 1000,
  })
  const { title, authors, venue, year, url, description } = publication

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeaveCard = () => {
    setHovered(false)
    handleMouseLeave()
  }
  const handleCardClick = () => onSelect?.(publication)
  const handleEditClick = (e) => { e.stopPropagation(); onEdit?.() }
  const handleDeleteClick = (e) => { e.stopPropagation(); onDelete?.() }

  return (
    <motion.div
      ref={tiltRef}
      style={tiltStyle}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleCardClick : undefined}
      onKeyDown={onSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } } : undefined}
      className="relative rounded-2xl overflow-visible cursor-pointer"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeaveCard}
    >
      {/* Outer glow — intensifies on hover */}
      <motion.div
        className="absolute -inset-px rounded-2xl -z-10"
        animate={{
          boxShadow: hovered
            ? '0 0 42px rgba(0, 212, 255, 0.16), 0 0 70px rgba(0, 212, 255, 0.08)'
            : '0 0 26px rgba(0, 212, 255, 0.065), 0 0 45px rgba(0, 212, 255, 0.04)',
        }}
        transition={{ duration: 0.25 }}
      />

      {/* Subtle floating animation */}
      <motion.div
        className="h-full"
        animate={{ y: [0, -3, 0] }}
        transition={{
          duration: 4 + index * 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.article
          className="relative rounded-2xl border bg-black/40 backdrop-blur-md overflow-hidden h-full"
          animate={{
            y: hovered ? CARD_HOVER_LIFT_PX : 0,
            scale: hovered ? CARD_HOVER_SCALE : 1,
            borderColor: hovered ? 'rgba(0, 212, 255, 0.35)' : 'rgba(255,255,255,0.1)',
            boxShadow: hovered
              ? '0 0 0 1px rgba(0,212,255,0.35), 0 0 32px rgba(0,212,255,0.12), 0 8px 24px -8px rgba(0,0,0,0.4)'
              : '0 0 0 1px rgba(0,212,255,0.08), 0 0 24px rgba(0,212,255,0.04)',
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Static gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 70%, rgba(0,212,255,0.02) 100%)',
            }}
          />
          {/* Mouse-follow spotlight */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-[250ms]"
            style={{
              opacity: hovered ? 1 : 0,
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)`,
            }}
            aria-hidden
          />

          <div className="relative p-5 md:p-6">
            <h3 className="font-orbitron text-lg md:text-xl text-accent mb-1.5" style={{ textShadow: 'none' }}>
              {title}
            </h3>
            <motion.div
              className="font-space text-xs text-gray-500 mb-2 flex flex-wrap gap-x-3 gap-y-0.5"
              animate={{ opacity: hovered ? 0.9 : 0.7 }}
              transition={{ duration: 0.25 }}
            >
              {authors && <span>{authors}</span>}
              {venue && <span>{venue}</span>}
              {year && <span>{year}</span>}
            </motion.div>
            {description && (
              <ul className="list-disc list-inside text-gray-300 font-exo text-sm leading-relaxed mb-3 space-y-1">
                {description.split(/\n/).filter(Boolean).map((line, i) => (
                  <li key={i}>{line.trim()}</li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
              {url && (
                <motion.a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-exo text-sm transition-colors"
                  animate={{ opacity: hovered ? 1 : 0.85, color: hovered ? 'rgba(0, 212, 255, 1)' : 'rgba(0, 212, 255, 0.9)' }}
                  transition={{ duration: 0.25 }}
                >
                  <ExternalLink size={14} />
                  View publication
                </motion.a>
              )}
              {isAdmin && (
                <>
                  <button type="button" onClick={handleEditClick} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-accent font-exo text-sm"><Pencil size={14} /> Edit</button>
                  <button type="button" onClick={handleDeleteClick} className="inline-flex items-center gap-1.5 text-red-400/80 hover:text-red-400 font-exo text-sm"><Trash2 size={14} /> Delete</button>
                </>
              )}
            </div>
          </div>
        </motion.article>
      </motion.div>
    </motion.div>
  )
}

function PublicationFormModal({ publication, onClose, onSaved }) {
  const isEdit = publication != null
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => ({
    slug: publication?.slug ?? '',
    title: publication?.title ?? '',
    authors: publication?.authors ?? '',
    venue: publication?.venue ?? '',
    year: publication?.year ?? '',
    url: publication?.url ?? '',
    description: publication?.description ?? '',
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        title: form.title.trim(),
        authors: form.authors.trim() || undefined,
        venue: form.venue.trim() || undefined,
        year: form.year.trim() || undefined,
        url: form.url.trim() || undefined,
        description: form.description.trim() || undefined,
      }
      if (isEdit) {
        await adminApi.updatePublication(publication.id, payload)
      } else {
        await adminApi.createPublication(payload)
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
          <span className="font-orbitron text-accent">{isEdit ? 'Edit publication' : 'Add publication'}</span>
          <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded text-gray-400 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto min-h-0 flex-1">
          {['title', 'slug', 'authors', 'venue', 'year', 'url'].map((key) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 font-orbitron mb-1 capitalize">{key}</label>
              <input type={key === 'url' ? 'url' : 'text'} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none" required={key === 'title' || key === 'slug'} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-500 font-orbitron mb-1">Description</label>
            <p className="text-xs text-gray-500 mb-1">One point per line (same as Projects/Experience).</p>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none resize-y" placeholder="First point&#10;Second point&#10;Third point" />
          </div>
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2">
              <p className="text-red-400 text-sm font-medium">Request failed</p>
              <p className="text-red-300/90 text-sm mt-0.5">{error}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-orbitron text-sm hover:bg-accent/30 disabled:opacity-50">{saving ? 'Saving…' : (isEdit ? 'Save' : 'Create')}</button>
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 rounded-lg border border-glass-border text-gray-400 font-orbitron text-sm hover:text-white">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
  return createPortal(modal, document.body)
}
