import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { contentService } from '../services/contentService'
import { useMouseTilt } from '../hooks/useMouseTilt'
import PublicationDetailModal from '../components/PublicationDetailModal/PublicationDetailModal'

const CARD_SPRING = { type: 'spring', stiffness: 360, damping: 28 }
const CARD_HOVER_LIFT_PX = -4
const CARD_HOVER_SCALE = 1.02

export default function Publications() {
  const [publications, setPublications] = useState([])
  const [archiveLoaded, setArchiveLoaded] = useState(false)
  const [selectedPublication, setSelectedPublication] = useState(null)
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.2 })

  useEffect(() => {
    contentService.getPublications().then(setPublications)
  }, [])

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setArchiveLoaded(true), 1400)
    return () => clearTimeout(t)
  }, [inView])

  return (
    <motion.div
      ref={sectionRef}
      className="relative max-w-4xl mx-auto px-6 py-8"
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
        <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-2">
          Publications
        </h1>
        <p className="text-gray-400 font-exo text-base mb-6">
          Research and written work
        </p>

        <div className="grid gap-4 grid-cols-1 w-full">
          {publications.map((pub, i) => (
            <PublicationCard
              key={pub.id}
              publication={pub}
              index={i}
              inView={inView && archiveLoaded}
              onSelect={setSelectedPublication}
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
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function PublicationCard({ publication, index, inView, onSelect }) {
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
            <h3 className="font-orbitron text-lg md:text-xl text-accent mb-1.5">
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
              <p className="text-gray-300 font-exo text-sm leading-relaxed mb-3">
                {description}
              </p>
            )}
            {url && (
              <motion.a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-exo text-sm transition-colors"
                animate={{ opacity: hovered ? 1 : 0.85, color: hovered ? 'rgba(0, 212, 255, 1)' : 'rgba(0, 212, 255, 0.9)' }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
                View publication
              </motion.a>
            )}
          </div>
        </motion.article>
      </motion.div>
    </motion.div>
  )
}
