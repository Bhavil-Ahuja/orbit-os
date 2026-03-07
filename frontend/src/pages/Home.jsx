import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { contentService } from '../services/contentService'
import { useAppStore } from '../store/useAppStore'
import { useTypingEffect } from '../hooks/useTypingEffect'
import EclipseCore from '../components/EclipseCore/EclipseCore'

// Boot sequence: micro-pauses between lines (300–500ms), moment to read "Access Granted".
const TYPING_MS = 38
const LINE_PAUSE_MS = 400
const AFTER_ACCESS_GRANTED_MS = 900

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
  const [bootStep, setBootStep] = useState(0)
  const [showName, setShowName] = useState(false)
  const [showButton, setShowButton] = useState(false)

  const bootLines = landing?.bootLines ?? DEFAULT_BOOT_LINES
  const currentLine = bootLines[bootStep] ?? ''
  const { display: typedLine, done } = useTypingEffect(currentLine, TYPING_MS, !!currentLine)

  useEffect(() => {
    contentService.getLanding().then(setLanding)
  }, [])

  useEffect(() => {
    if (!done || !currentLine) return
    const t = setTimeout(() => {
      if (bootStep < bootLines.length - 1) {
        setBootStep((s) => s + 1)
      } else {
        setBootInProgress(false)
        setTimeout(() => setShowName(true), AFTER_ACCESS_GRANTED_MS)
      }
    }, LINE_PAUSE_MS)
    return () => clearTimeout(t)
  }, [done, bootStep, bootLines.length, currentLine, setBootInProgress])

  useEffect(() => {
    if (showName) {
      const t = setTimeout(() => setShowButton(true), 300)
      return () => clearTimeout(t)
    }
  }, [showName])

  const handleEnter = () => {
    setBootComplete(true)
    navigate('/explore')
  }

  const name = landing?.name ?? 'BHAVIL AHUJA'
  const tagline = landing?.tagline ?? 'Engineering scalable systems beyond Earth\'s orbit'

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <EclipseCore triggerPulse={showName} />

      {/* Terminal: stays visible with blinking cursor after "Access Granted" */}
      <div className="relative z-10 font-space text-accent/90 text-lg md:text-xl mb-8 min-h-[5rem]">
        <AnimatePresence mode="wait">
          {bootStep < bootLines.length && (
            <motion.div
              key={bootStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <span className="text-green-500/80">&gt;</span>
              <span>{typedLine}</span>
              <motion.span
                className="inline-block min-w-[0.5em]"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.53, repeat: Infinity, ease: 'linear' }}
                aria-hidden
              >
                |
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
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
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {name}
            </motion.h1>
            <motion.p
              className="text-gray-400 font-exo text-lg md:text-xl max-w-xl mx-auto mb-12"
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            >
              &ldquo;{tagline}&rdquo;
            </motion.p>
            <div className="min-h-[3.5rem] flex items-center justify-center">
              {showButton ? (
                <motion.button
                  type="button"
                  onClick={handleEnter}
                  className="px-8 py-4 rounded-lg font-orbitron text-accent border-2 border-accent/60 bg-accent/5 hover:bg-accent/15 hover:shadow-glow transition-all duration-300"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore the Universe
                </motion.button>
              ) : (
                <span className="inline-block min-h-[3.5rem]" aria-hidden />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
