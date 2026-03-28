import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { contentService } from '../services/contentService'
import { useAppStore } from '../store/useAppStore'
import { useTypingEffect } from '../hooks/useTypingEffect'
import EclipseCore from '../components/EclipseCore/EclipseCore'

// Boot sequence: typing + pauses between lines (ms).
const TYPING_MS = 28
const LINE_PAUSE_MS = 210
const AFTER_ACCESS_GRANTED_MS = 350

const DEFAULT_BOOT_LINES = [
  'Initializing Orbit OS...',
  'Authenticating Visitor...',
  'Access Granted',
]

export default function Home() {
  const navigate = useNavigate()
  const setBootComplete = useAppStore((s) => s.setBootComplete)
  const setBootInProgress = useAppStore((s) => s.setBootInProgress)
  const [landing, setLanding] = useState(null)
  /** Finished boot lines, top to bottom; active typing row is below these. */
  const [completedBootLines, setCompletedBootLines] = useState([])
  const [showName, setShowName] = useState(false)
  const [showButton, setShowButton] = useState(false)

  const bootLines = landing?.bootLines ?? DEFAULT_BOOT_LINES
  const activeLineIndex = completedBootLines.length
  const stillTypingBoot = activeLineIndex < bootLines.length
  const lineBeingTyped = stillTypingBoot ? (bootLines[activeLineIndex] ?? '') : ''
  const { display: typedLine, done } = useTypingEffect(
    lineBeingTyped,
    TYPING_MS,
    stillTypingBoot && !!lineBeingTyped
  )

  useEffect(() => {
    contentService.getLanding().then(setLanding)
  }, [])

  useEffect(() => {
    if (!stillTypingBoot || !done || !lineBeingTyped) return
    const t = setTimeout(() => {
      setCompletedBootLines((prev) => {
        const line = bootLines[prev.length]
        const next = [...prev, line]
        if (next.length >= bootLines.length) {
          setBootInProgress(false)
          setTimeout(() => setShowName(true), AFTER_ACCESS_GRANTED_MS)
        }
        return next
      })
    }, LINE_PAUSE_MS)
    return () => clearTimeout(t)
  }, [done, stillTypingBoot, lineBeingTyped, bootLines, setBootInProgress])

  useEffect(() => {
    if (showName) {
      const t = setTimeout(() => setShowButton(true), 165)
      return () => clearTimeout(t)
    }
  }, [showName])

  const handleEnter = () => {
    setBootComplete(true)
    navigate('/explore')
  }

  const name = landing?.name ?? 'BHAVIL AHUJA'
  const tagline = landing?.tagline ?? 'Engineering scalable systems beyond Earth\'s orbit'
  const finalBootLine = bootLines.length > 0 ? bootLines[bootLines.length - 1] : ''

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <EclipseCore triggerPulse={showName} />

      {/* Terminal: stacked boot lines centred on page; after name appears, only final line remains */}
      <div
        className={`relative z-10 font-space text-accent/90 text-lg md:text-xl mb-8 w-full flex flex-col items-center justify-center ${
          showName ? 'min-h-[2.25rem]' : 'min-h-[6.5rem]'
        }`}
      >
        {showName ? (
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-green-500/80 shrink-0">&gt;</span>
            <span>{finalBootLine}</span>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-1.5 items-center w-full">
            {completedBootLines.map((line, i) => (
              <motion.div
                key={`done-${i}-${line}`}
                className="flex items-center justify-center gap-2"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
              >
                <span className="text-green-500/80 shrink-0">&gt;</span>
                <span>{line}</span>
              </motion.div>
            ))}
            {stillTypingBoot && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-500/80 shrink-0">&gt;</span>
                <span>{typedLine}</span>
                <motion.span
                  className="inline-block min-w-[0.5em]"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.53, repeat: Infinity, ease: 'linear' }}
                  aria-hidden
                >
                  |
                </motion.span>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showName && (
          <motion.div
            className="relative z-10 text-center min-h-[280px] md:min-h-[320px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.h1
              className="font-orbitron text-4xl md:text-6xl font-bold text-white tracking-wider mb-4"
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
            >
              {name}
            </motion.h1>
            <motion.p
              className="text-gray-400 font-exo text-lg md:text-xl max-w-xl mx-auto mb-12"
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.32, delay: 0.06, ease: 'easeOut' }}
            >
              &ldquo;{tagline}&rdquo;
            </motion.p>
            <div className="flex min-h-[4.5rem] items-center justify-center">
              {showButton ? (
                <motion.button
                  type="button"
                  onClick={handleEnter}
                  className="px-8 py-4 rounded-lg font-orbitron text-accent border-2 border-accent/60 bg-accent/5 hover:bg-accent/15 hover:shadow-glow transition-all duration-300"
                  initial={{ opacity: 0, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.32, delay: 0.12, ease: 'easeOut' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore the Universe
                </motion.button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
