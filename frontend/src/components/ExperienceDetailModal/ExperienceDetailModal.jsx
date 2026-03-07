import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pencil, Trash2 } from 'lucide-react'

/** Parse impact into bullet items (array or string). */
function impactToBullets(impact) {
  if (Array.isArray(impact)) return impact.filter(Boolean)
  if (!impact || typeof impact !== 'string') return []
  return impact
    .split(/\.\s+/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
}

export default function ExperienceDetailModal({ mission, onClose, isAdmin, onEdit, onDelete }) {
  useEffect(() => {
    if (!mission) return
    const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [mission, onClose])

  if (!mission) return null

  const bullets = impactToBullets(mission.impact)
  const isActive = mission.status === 'ACTIVE'

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
        aria-labelledby="experience-detail-title"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden
        />
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
            <h2
              id="experience-detail-title"
              className="font-orbitron text-xl text-accent"
              style={{ textShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}
            >
              {mission.mission}
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
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            <section>
              <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-2">
                MISSION LOG
              </div>
              <div className="font-exo text-gray-200 text-sm space-y-2">
                <p><span className="text-gray-500">Role</span> {mission.role ?? '—'}</p>
                <p><span className="text-gray-500">Period</span> {mission.period ?? '—'}</p>
                <p>
                  <span className="text-gray-500">Status</span>{' '}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-sm ${
                      isActive ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-300'
                    }`}
                  >
                    {mission.status ?? '—'}
                  </span>
                </p>
              </div>
            </section>

            {bullets.length > 0 && (
              <section>
                <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-2">
                  IMPACT
                </div>
                <ul className="font-exo text-gray-200 text-sm leading-relaxed space-y-1.5 list-none">
                  {bullets.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent/80 shrink-0">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
