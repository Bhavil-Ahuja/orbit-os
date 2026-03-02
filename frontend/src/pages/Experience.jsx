import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { contentService } from '../services/contentService'

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

/** Parse impact string into bullet items (sentences); support array from API. */
function impactToBullets(impact) {
  if (Array.isArray(impact)) return impact.filter(Boolean)
  if (!impact || typeof impact !== 'string') return []
  return impact
    .split(/\.\s+/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
}

function MissionCard({ mission, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [hovered, setHovered] = useState(false)
  const isActive = mission.status === 'ACTIVE'
  const bullets = impactToBullets(mission.impact)

  return (
    <motion.div
      ref={ref}
      custom={[index, isActive]}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-lg border border-glass-border bg-panel-bg/90 backdrop-blur-md p-6 shadow-panel overflow-hidden transition-colors duration-300"
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

      <div className="relative z-10 flex flex-wrap items-center gap-2 mb-2">
        <span className={`font-orbitron text-sm ${isActive ? 'text-accent' : 'text-accent/70'}`}>
          MISSION:
        </span>
        <span className="font-orbitron text-white">{mission.mission}</span>
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
    </motion.div>
  )
}

export default function Experience() {
  const [items, setItems] = useState([])
  const [entryKey, setEntryKey] = useState(0)
  const activeSection = useAppStore((s) => s.activeSection)
  const prevSectionRef = useRef(activeSection)

  useEffect(() => {
    contentService.getExperience().then(setItems)
  }, [])

  useEffect(() => {
    if (prevSectionRef.current !== 'experience' && activeSection === 'experience') {
      setEntryKey((k) => k + 1)
    }
    prevSectionRef.current = activeSection
  }, [activeSection])

  return (
    <motion.div
      className="max-w-3xl mx-auto px-6 py-12 relative"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Module activation: content fades in + slides up when section becomes active (100ms after env) */}
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
        {/* Faint vertical trajectory — mission history / navigation path */}
        <div
          className="absolute left-5 top-16 bottom-12 w-px pointer-events-none hidden sm:block"
          aria-hidden
        >
          <div
            className="w-full h-full"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.055) 20%, rgba(0, 212, 255, 0.04) 50%, rgba(0, 212, 255, 0.055) 80%, transparent 100%)',
            }}
          />
        </div>

        <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-2">
          Experience
        </h1>
        <p className="text-gray-400 font-exo text-base mb-8">Mission logs</p>
        <div className="space-y-4 relative pl-0 sm:pl-2">
          {items.map((mission, i) => (
            <MissionCard key={mission.id} mission={mission} index={i} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
