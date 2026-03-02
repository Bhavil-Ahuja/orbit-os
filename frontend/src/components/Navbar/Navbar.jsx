import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { scrollToSection } from '../../hooks/useScrollSection'

const sections = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'publications', label: 'Publications' },
  { id: 'skills', label: 'Skills' },
  { id: 'resume', label: 'Resume' },
  { id: 'stay-in-touch', label: 'Stay in Touch' },
]

function NavItem({ id, label, isActive }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={() => scrollToSection(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left w-full relative rounded-lg overflow-hidden"
    >
      <span
        className={`
          relative block px-4 py-2 rounded-lg font-orbitron text-sm border backdrop-blur-sm
          transition-colors duration-300
          ${isActive
            ? 'text-accent border-accent/55 bg-panel-bg/80'
            : 'text-gray-500 border-white/10 bg-panel-bg/40 opacity-65 hover:opacity-90'
          }
        `}
      >
        {/* ACTIVE: stable base illumination */}
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.span
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
                boxShadow: 'inset 0 0 20px rgba(0, 212, 255, 0.05)',
              }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* ACTIVE: persistent energy — barely perceptible breathing (0.85 → 1 → 0.85) */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.88, 1, 0.88] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                background: 'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0, 212, 255, 0.14) 0%, transparent 65%)',
              }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* ACTIVE: power indicator bar (left edge) — opacity only for smooth transition */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              className="absolute left-0 top-[20%] bottom-[20%] w-0.5 rounded-r pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ background: 'rgba(0, 212, 255, 0.85)' }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* ACTIVE: one-time power-up sweep when becoming active */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              key={id}
              className="absolute inset-0 rounded-lg pointer-events-none origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.15) 0%, transparent 55%)',
                willChange: 'transform',
              }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* HOVER (inactive only): brief horizontal energy sweep — no persistent fill */}
        <AnimatePresence>
          {!isActive && hovered && (
            <motion.span
              className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden origin-left"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              aria-hidden
            >
              <motion.span
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.08) 0%, transparent 50%)',
                  willChange: 'transform',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              />
            </motion.span>
          )}
        </AnimatePresence>

        {/* HOVER (inactive only): temporary glow that fades back toward idle */}
        <AnimatePresence>
          {!isActive && hovered && (
            <motion.span
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.1, 0.02] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0, 212, 255, 0.06) 0%, transparent 70%)',
              }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        <span className="relative z-10 block">{label}</span>
      </span>
    </button>
  )
}

export default function Navbar() {
  const activeSection = useAppStore((s) => s.activeSection)

  return (
    <nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 pr-2"
      role="navigation"
      aria-label="Main"
    >
      {sections.map(({ id, label }) => (
        <NavItem
          key={id}
          id={id}
          label={label}
          isActive={activeSection === id}
        />
      ))}
    </nav>
  )
}
