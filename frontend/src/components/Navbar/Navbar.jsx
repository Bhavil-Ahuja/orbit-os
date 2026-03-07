import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useIsAdmin } from '../../hooks/useIsAdmin'
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

function NavItem({ id, label, isActive, onNavigate }) {
  const [hovered, setHovered] = useState(false)

  const handleClick = useCallback(() => {
    scrollToSection(id)
    onNavigate?.()
  }, [id, onNavigate])

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left w-full relative rounded-lg overflow-hidden"
    >
      <span
        className={`
          relative block px-4 py-2.5 rounded-lg font-orbitron text-sm border backdrop-blur-sm
          transition-colors duration-300
          ${isActive
            ? 'text-accent border-accent/55 bg-panel-bg/80'
            : 'text-gray-500 border-white/10 bg-panel-bg/40 opacity-65 hover:opacity-90'
          }
        `}
      >
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
        <AnimatePresence>
          {!isActive && hovered && (
            <motion.span
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              exit={{ opacity: 0 }}
              style={{ background: 'rgba(0, 212, 255, 0.15)' }}
              aria-hidden
            />
          )}
        </AnimatePresence>
        <span className="relative z-10 block">{label}</span>
      </span>
    </button>
  )
}

function DesktopNav() {
  const activeSection = useAppStore((s) => s.activeSection)
  const isAdmin = useIsAdmin()

  return (
    <nav
      className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-2 pr-2"
      role="navigation"
      aria-label="Main"
    >
      {isAdmin && (
        <Link
          to="/whoami"
          className="px-3 py-1.5 rounded-lg border border-accent/50 bg-accent/10 text-accent font-orbitron text-xs text-center hover:bg-accent/20 transition-colors mb-1"
        >
          Admin
        </Link>
      )}
      {sections.map(({ id, label }) => (
        <NavItem key={id} id={id} label={label} isActive={activeSection === id} />
      ))}
    </nav>
  )
}

function MobileNav() {
  const [open, setOpen] = useState(false)
  const activeSection = useAppStore((s) => s.activeSection)
  const isAdmin = useIsAdmin()

  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed z-50 p-2.5 rounded-xl border border-glass-border bg-panel-bg/90 backdrop-blur-md text-gray-400 hover:text-accent hover:border-accent/40 transition-colors touch-manipulation top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))]"
        aria-label="Open menu"
      >
        <Menu size={24} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              aria-hidden
            />
            <motion.aside
              className="md:hidden fixed top-0 left-0 bottom-0 z-[70] w-[min(280px,85vw)] flex flex-col gap-2 p-4 pt-[max(3.5rem,calc(env(safe-area-inset-top)+2.5rem))] border-r border-glass-border bg-panel-bg/98 backdrop-blur-md shadow-panel overflow-y-auto"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              role="dialog"
              aria-label="Navigation menu"
            >
              <button
                type="button"
                onClick={close}
                className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors touch-manipulation"
                aria-label="Close menu"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
              {isAdmin && (
                <Link
                  to="/whoami"
                  onClick={close}
                  className="px-4 py-3 rounded-lg border border-accent/50 bg-accent/10 text-accent font-orbitron text-sm text-center hover:bg-accent/20 transition-colors"
                >
                  Admin
                </Link>
              )}
              {sections.map(({ id, label }) => (
                <NavItem
                  key={id}
                  id={id}
                  label={label}
                  isActive={activeSection === id}
                  onNavigate={close}
                />
              ))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Navbar() {
  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  )
}
