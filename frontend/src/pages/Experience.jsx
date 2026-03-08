import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { contentService } from '../services/contentService'
import { useMouseTilt } from '../hooks/useMouseTilt'
import { adminApi } from '../api/adminApi'
import { publicApi } from '../api/publicApi'
import ExperienceDetailModal from '../components/ExperienceDetailModal/ExperienceDetailModal'

const ENTRY_DURATION_MS = 400
const ENTRY_DELAY_MS = 100

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: ([i, isActive]) => ({
    opacity: 1,
    y: 0,
    scale: isActive ? 1.03 : 1,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
}

/** ACTIVE first, then by end date descending (parsed from period). */
function sortExperiencesByActiveThenEndDateDesc(list) {
  const endKey = (m) => {
    if (m.status === 'ACTIVE') return -Infinity
    const p = (m.period || '').trim()
    if (/present/i.test(p)) return -Infinity
    // Split on " - " or " – " (space dash space) so we don't split inside "2023-05"
    const range = p.split(/\s+[–\-]\s+/)
    const to = range.length >= 2 ? range[1].trim() : ''
    const match = to.match(/(\d{4})(?:-?(\d{2}))?/) || to.match(/(\d{4})/)
    if (!match) return 0
    const y = parseInt(match[1], 10)
    const month = match[2] ? parseInt(match[2], 10) : 12
    return -(y * 12 + month)
  }
  return [...list].sort((a, b) => endKey(a) - endKey(b))
}

/** Parse impact string into bullet items (sentences); support array from API. */
function impactToBullets(impact) {
  if (Array.isArray(impact)) return impact.filter(Boolean)
  if (!impact || typeof impact !== 'string') return []
  return impact
    .split(/\.\s+/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
}

function MissionCard({ mission, index, isAdmin, onSelect, onEdit, onDelete }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [hovered, setHovered] = useState(false)
  const { ref: tiltRef, mousePos, handleMouseMove, handleMouseLeave } = useMouseTilt({
    maxTilt: 0,
    perspective: 1000,
  })
  const isActive = mission.status === 'ACTIVE'
  const bullets = impactToBullets(mission.impact)

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeaveCard = () => {
    setHovered(false)
    handleMouseLeave()
  }

  return (
    <div
      ref={tiltRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeaveCard}
      className="relative"
    >
    <motion.div
      ref={ref}
      custom={[index, isActive]}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      onClick={onSelect ? () => onSelect(mission) : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={onSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(mission) } } : undefined}
      className={`relative rounded-lg border border-glass-border bg-panel-bg/90 backdrop-blur-md p-6 shadow-panel overflow-hidden transition-colors duration-300 ${onSelect ? 'cursor-pointer' : ''}`}
      style={
        isActive
          ? {
              /* Contained glow: tight inner ring + short outer fade; ~25% smaller blur, stronger at edge */
              boxShadow: '0 6px 24px rgba(0,0,0,0.28), 0 0 12px rgba(0, 212, 255, 0.14), 0 0 28px rgba(0, 212, 255, 0.035), inset 0 0 0 1px rgba(0, 212, 255, 0.08)',
              backgroundColor: 'rgba(0, 212, 255, 0.03)',
            }
          : { boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }
      }
      whileHover={
        isActive
          ? { borderColor: 'rgba(0, 212, 255, 0.25)', transition: { duration: 0.2 } }
          : {
              y: -4,
              borderColor: 'rgba(0, 212, 255, 0.35)',
              transition: { duration: 0.2 },
            }
      }
    >
      {/* Single border energy sweep on hover (inactive only, once per hover) */}
      <AnimatePresence>
        {!isActive && hovered && (
          <span className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden" aria-hidden>
            <motion.span
              className="absolute top-0 left-0 h-px w-1/2"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.45))',
                willChange: 'transform',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </span>
        )}
      </AnimatePresence>

      {/* COMPLETED only: archived tone + subtle scan texture (pointer-events-none so hover preserved) */}
      {!isActive && (
        <>
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ background: 'rgba(0, 0, 0, 0.09)' }}
            aria-hidden
          />
          <div
            className="absolute inset-0 rounded-lg pointer-events-none opacity-[0.025]"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 3px)',
            }}
            aria-hidden
          />
        </>
      )}

      {/* Mouse-follow spotlight — same as Projects / Publications */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-[250ms]"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-wrap items-center gap-2 mb-2">
        <span className={`font-orbitron text-sm ${isActive ? 'text-accent' : 'text-accent/70'}`}>
          MISSION:
        </span>
        <span className="font-orbitron text-lg md:text-xl text-white">{mission.mission}</span>
      </div>
      <div className="relative z-10 flex flex-wrap items-center gap-3 mb-3">
        <span className="font-space text-gray-500 text-xs uppercase tracking-wider">Status</span>
        <span
          className={`
            inline-flex items-center gap-1.5 font-exo text-sm px-2.5 py-1 rounded
            ${isActive ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-300'}
          `}
        >
          {/* Live monitoring indicator */}
          {isActive ? (
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" aria-hidden />
          )}
          {mission.status}
        </span>
        <span className="font-exo text-gray-400 text-sm">Role: {mission.role}</span>
        <span className="font-exo text-gray-400 text-sm">Period: {mission.period}</span>
      </div>

      <div className="relative z-10 mt-3">
        <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-1.5">
          IMPACT
        </div>
        <ul className="font-exo text-gray-200 text-sm leading-relaxed space-y-1 list-none">
          {bullets.map((line, j) => (
            <li key={j} className="flex gap-2">
              <span className={`shrink-0 ${isActive ? 'text-accent/80' : 'text-accent/55'}`}>•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
      {isAdmin && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => onEdit?.(mission)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-xs hover:bg-accent/10">
            <Pencil size={12} /> Edit
          </button>
          <button type="button" onClick={() => onDelete?.(mission)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-red-500/40 text-red-400/90 font-orbitron text-xs hover:bg-red-500/10">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </motion.div>
    </div>
  )
}

export default function Experience() {
  const [items, setItems] = useState([])
  const [entryKey, setEntryKey] = useState(0)
  const [archiveLoaded, setArchiveLoaded] = useState(false)
  const [sweepDone, setSweepDone] = useState(false)
  const [selectedMission, setSelectedMission] = useState(null)
  const [experienceForm, setExperienceForm] = useState(null) // null | 'add' | mission (edit)
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.2 })
  const activeSection = useAppStore((s) => s.activeSection)
  const prevSectionRef = useRef(activeSection)
  const isAdmin = useIsAdmin()
  const refetchBootstrap = useAppStore((s) => s.refetchBootstrap)

  const refreshItems = async () => {
    try {
      await refetchBootstrap()
      const next = await publicApi.getExperience()
      setItems(Array.isArray(next) ? next : [])
    } catch (_) {
      const next = await contentService.getExperience().then((d) => d ?? []).catch(() => [])
      setItems(Array.isArray(next) ? next : [])
    }
  }

  useEffect(() => {
    contentService.getExperience().then((next) => setItems(Array.isArray(next) ? next : []))
  }, [])

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setArchiveLoaded(true), 1400)
    return () => clearTimeout(t)
  }, [inView])

  useEffect(() => {
    if (prevSectionRef.current !== 'experience' && activeSection === 'experience') {
      setEntryKey((k) => k + 1)
      setSweepDone(false)
    }
    prevSectionRef.current = activeSection
  }, [activeSection])

  const handleDelete = async (mission) => {
    if (!isAdmin || !window.confirm(`Delete "${mission.mission}"?`)) return
    try {
      await adminApi.deleteExperience(mission.id)
      await refreshItems()
      if (selectedMission?.id === mission.id) setSelectedMission(null)
    } catch (e) {
      window.alert(e?.message ?? 'Delete failed')
    }
  }

  const sortedItems = useMemo(() => sortExperiencesByActiveThenEndDateDesc(items), [items])

  return (
    <motion.div
      ref={sectionRef}
      className={`relative max-w-3xl mx-auto px-6 py-12 ${!archiveLoaded ? 'min-h-[min(100vh,900px)]' : ''}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Same outer boundary as Projects / Publications */}
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
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none min-h-[200px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="font-space text-accent/90 text-sm flex items-center gap-2">
              <span className="text-green-500/80">&gt;</span>
              Loading Mission Log...
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
          className="absolute inset-0 pointer-events-none z-[1]"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: sweepDone ? 0 : 1 }}
          transition={{ duration: sweepDone ? 0.3 : 0.2 }}
        >
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 2, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}
            onAnimationComplete={() => setSweepDone(true)}
          />
        </motion.div>
      )}

      {/* Module activation: content fades in + slides up when section becomes active (100ms after env) */}
      {inView && archiveLoaded && (
      <motion.div
        key={entryKey}
        className="relative"
        initial={entryKey === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: ENTRY_DURATION_MS / 1000,
          delay: entryKey === 0 ? 0 : ENTRY_DELAY_MS / 1000,
          ease: 'easeOut',
        }}
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-2" style={{ textShadow: 'none' }}>
              Experience
            </h1>
            <p className="text-gray-400 font-exo text-base mb-8">Mission logs</p>
          </div>
          {isAdmin && (
            <button type="button" onClick={() => setExperienceForm('add')} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-sm hover:bg-accent/10 shrink-0">
              <Plus size={14} /> Add
            </button>
          )}
        </div>
        <div className="space-y-4 relative pl-0 sm:pl-2">
          {sortedItems.map((mission, i) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              index={i}
              isAdmin={isAdmin}
              onSelect={setSelectedMission}
              onEdit={() => setExperienceForm(mission)}
              onDelete={() => handleDelete(mission)}
            />
          ))}
        </div>
      </motion.div>
      )}

      <AnimatePresence>
        {selectedMission && (
          <ExperienceDetailModal
            mission={selectedMission}
            onClose={() => setSelectedMission(null)}
            isAdmin={isAdmin}
            onEdit={() => { setSelectedMission(null); setExperienceForm(selectedMission) }}
            onDelete={() => handleDelete(selectedMission)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {experienceForm && (
          <ExperienceFormModal
            mission={experienceForm === 'add' ? null : experienceForm}
            onClose={() => setExperienceForm(null)}
            onSaved={async () => { await refreshItems(); setExperienceForm(null) }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const EXPERIENCE_STATUS_OPTIONS = ['ACTIVE', 'COMPLETED']

function parsePeriod(periodStr) {
  if (!periodStr || typeof periodStr !== 'string') return { fromDate: '', toDate: '', currentlyWorking: true }
  const p = periodStr.trim()
  const lower = p.toLowerCase()
  if (lower === 'present' || lower.includes('present')) {
    const match = p.match(/(\d{4})(?:-(\d{2}))?/)
    if (match) return { fromDate: match[2] ? `${match[1]}-${match[2]}` : `${match[1]}-01`, toDate: '', currentlyWorking: true }
    return { fromDate: '', toDate: '', currentlyWorking: true }
  }
  const range = p.split(/\s*[–\-]\s*/)
  if (range.length >= 2) {
    const from = range[0].trim()
    const to = range[1].trim()
    const fromMatch = from.match(/(\d{4})(?:-(\d{2}))?/) || from.match(/(\d{4})/)
    const toMatch = to.match(/(\d{4})(?:-(\d{2}))?/) || to.match(/(\d{4})/)
    const fromDate = fromMatch ? (fromMatch[2] ? `${fromMatch[1]}-${fromMatch[2]}` : `${fromMatch[1]}-01`) : ''
    const toDate = toMatch ? (toMatch[2] ? `${toMatch[1]}-${toMatch[2]}` : `${toMatch[1]}-12`) : ''
    return { fromDate, toDate, currentlyWorking: false }
  }
  return { fromDate: '', toDate: '', currentlyWorking: true }
}

function formatPeriod(fromDate, toDate, currentlyWorking) {
  if (!fromDate) return currentlyWorking ? 'Present' : ''
  return currentlyWorking ? `${fromDate} - Present` : (toDate ? `${fromDate} - ${toDate}` : fromDate)
}

const inputClass = 'w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none'
const labelClass = 'block text-xs text-gray-500 font-orbitron mb-1'

function ExperienceFormModal({ mission, onClose, onSaved }) {
  const isEdit = mission != null
  const parsed = parsePeriod(mission?.period)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => ({
    slug: mission?.slug ?? '',
    mission: mission?.mission ?? '',
    role: mission?.role ?? '',
    status: mission?.status ?? 'ACTIVE',
    fromDate: parsed.fromDate,
    toDate: parsed.toDate,
    currentlyWorking: parsed.currentlyWorking,
    impact: Array.isArray(mission?.impact) ? mission.impact.join('\n') : '',
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const period = formatPeriod(form.fromDate, form.toDate, form.currentlyWorking)
    try {
      const payload = {
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        mission: form.mission.trim(),
        role: form.role.trim(),
        status: form.status.trim() || undefined,
        period,
        impact: form.impact.split(/\n/).map((s) => s.trim()).filter(Boolean),
      }
      if (isEdit) {
        await adminApi.updateExperience(mission.id, payload)
      } else {
        await adminApi.createExperience(payload)
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
        className="relative rounded-xl border border-glass-border bg-panel-bg/98 backdrop-blur-md w-full max-w-md max-h-[90vh] flex flex-col my-auto shrink-0"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <span className="font-orbitron text-accent">{isEdit ? 'Edit experience' : 'Add experience'}</span>
          <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded text-gray-400 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto min-h-0">
          {['mission', 'role', 'slug'].map((key) => (
            <div key={key}>
              <label className={labelClass}>{key}</label>
              <input type="text" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className={inputClass} required />
            </div>
          ))}
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
              {[...new Set([...EXPERIENCE_STATUS_OPTIONS, form.status].filter(Boolean))].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>From (date)</label>
              <input type="month" value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>To (date)</label>
              <input type="month" value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} className={inputClass} disabled={form.currentlyWorking} title={form.currentlyWorking ? 'Clear "Currently working" to set end date' : ''} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.currentlyWorking} onChange={(e) => setForm((f) => ({ ...f, currentlyWorking: e.target.checked, toDate: e.target.checked ? '' : f.toDate }))} className="rounded border border-glass-border bg-void/80 text-accent focus:ring-accent/50" />
            <span className="text-sm text-gray-300 font-space">Currently working here (no end date)</span>
          </label>
          <div>
            <label className={labelClass}>Impact (one per line)</label>
            <textarea value={form.impact} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))} rows={3} className={`${inputClass} resize-y`} />
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
