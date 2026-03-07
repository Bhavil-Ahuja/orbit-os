import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Maximize2, Download, Eye, FileText, Terminal, X } from 'lucide-react'
import { contentService } from '../../services/contentService'
import { getApiBase } from '../../api/client'

const DOSSIER_FILENAME = 'BHAVIL_AHUJA.RES'

/** Treat example.com and other placeholders as "not configured" so we don't trigger 404 iframes. */
function isPlaceholderResumeUrl(url) {
  if (!url || typeof url !== 'string') return true
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === 'example.com' || host === 'example.org'
  } catch {
    return true
  }
}
const BOOT_LINES = [
  '> Accessing personnel archive...',
  '> Verifying credentials...',
  '> Rendering encrypted dossier...',
]

const WATERMARK_LINES = ['PERSONNEL DOSSIER', 'CLEARANCE LEVEL: ENGINEERING']

function BootLog({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      const t = setTimeout(onComplete, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisibleLines((n) => n + 1), 420)
    return () => clearTimeout(t)
  }, [visibleLines, onComplete])

  return (
    <div className="min-h-[240px] flex flex-col justify-center px-6 py-8 font-space text-sm">
      {BOOT_LINES.map((line, i) => (
        <motion.div
          key={line}
          className="text-accent/90"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: visibleLines > i ? 1 : 0, x: visibleLines > i ? 0 : -8 }}
          transition={{ duration: 0.28 }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  )
}

function Scanlines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[3] opacity-[0.04]"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,212,255,0.2) 2px,
          rgba(0,212,255,0.2) 3px
        )`,
        backgroundSize: '100% 6px',
        animation: 'dossier-scanline 10s linear infinite',
      }}
    />
  )
}

function Watermark() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 select-none"
      style={{ opacity: 0.065 }}
    >
      <div
        className="font-orbitron text-[clamp(1.5rem,4vw,2.5rem)] uppercase tracking-[0.35em] text-accent/90 text-center"
        style={{ transform: 'rotate(-12deg)' }}
      >
        {WATERMARK_LINES.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  )
}

function TerminalView({ data }) {
  if (!data) {
    return (
      <div className="p-6 font-space text-sm text-gray-500">
        <div className="text-accent/80">&gt; Terminal view: no structured data</div>
        <div className="mt-2 text-gray-500">Configure resume.terminalData from API.</div>
      </div>
    )
  }
  const { name, title, sections } = data
  return (
    <div className="p-6 font-space text-sm overflow-auto h-full">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <div className="text-accent font-orbitron text-xs uppercase tracking-wider mb-1">
            $ cat personnel.dossier
          </div>
          <div className="text-accent/90 font-orbitron text-lg">{name}</div>
          <div className="text-gray-400 text-xs mt-0.5">{title}</div>
        </div>
        {sections?.map((section, i) => (
          <div key={section.title || i}>
            <div className="text-accent/70 font-orbitron text-xs uppercase tracking-wider mb-2">
              {section.title}
            </div>
            <div className="space-y-1 text-gray-300">
              {section.lines?.map((line, j) => (
                <div key={j} className="pl-2 border-l border-accent/30 text-gray-400">
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-gray-500 text-xs pt-2">$ _</div>
      </motion.div>
    </div>
  )
}

export default function ResumeViewer() {
  const containerRef = useRef(null)
  const inView = useInView(containerRef, { once: true, amount: 0.15 })
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bootDone, setBootDone] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState('dossier') // 'dossier' | 'terminal'

  useEffect(() => {
    if (!fullscreen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [fullscreen])

  useEffect(() => {
    contentService
      .getResume()
      .then(setResume)
      .catch(() => setResume(null))
      .finally(() => setLoading(false))
  }, [])

  // PDF URL with filename so the browser viewer shows "Bhavil_Ahuja_Resume.pdf" instead of "resume-file"
  const iframePdfUrl = useMemo(
    () => `${getApiBase()}/Bhavil_Ahuja_Resume.pdf`,
    []
  )

  const showBootLog = inView && !bootDone
  const hasResume = resume?.viewUrl && !isPlaceholderResumeUrl(resume.viewUrl)

  if (loading && !resume) {
    return (
      <motion.div
        ref={containerRef}
        className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-12 font-space text-gray-400 shadow-[0_0_40px_rgba(0,212,255,0.08)]"
        style={{
          background: 'linear-gradient(145deg, rgba(10,10,20,0.6) 0%, rgba(5,5,15,0.8) 100%)',
          boxShadow:
            '0 0 0 1px rgba(0,212,255,0.2), 0 0 30px rgba(0,212,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-accent/90">&gt; Connecting to archive...</div>
      </motion.div>
    )
  }

  if (!hasResume) {
    return (
      <motion.div
        ref={containerRef}
        className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-12 text-center font-space text-gray-400"
        style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Resume URL not configured. Configure GET /api/resume.
      </motion.div>
    )
  }

  const actions = [
    { icon: Eye, label: 'Inspect', href: resume.viewUrl, external: true },
    { icon: Download, label: 'Acquire Copy', href: resume.downloadUrl, download: true },
    { icon: Maximize2, label: 'Expand Interface', onClick: () => setFullscreen(true) },
  ]

  return (
    <>
      <motion.div
        ref={containerRef}
        className="rounded-xl overflow-hidden font-space"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'linear-gradient(145deg, rgba(10,10,20,0.6) 0%, rgba(5,5,15,0.8) 100%)',
          boxShadow:
            '0 0 0 1px rgba(0,212,255,0.2), 0 0 30px rgba(0,212,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.04), inset 0 -1px 0 0 rgba(0,0,0,0.2)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* System header bar — taller, divider glow, cyan underline pulse */}
        <div
          className="relative flex flex-wrap items-center justify-between gap-3 px-4 py-4 border-b border-white/10"
          style={{
            background: 'rgba(0,0,0,0.4)',
            boxShadow:
              'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 1px 0 0 rgba(0,212,255,0.15), 0 0 20px rgba(0,212,255,0.06)',
          }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-orbitron text-xs uppercase tracking-widest text-accent/90">
              Mission Dossier
            </span>
            <span className="text-gray-500 text-xs">/</span>
            <span className="text-gray-400 text-xs tabular-nums">{DOSSIER_FILENAME}</span>
            <div className="flex items-center gap-1 border-l border-white/10 pl-3 ml-1">
              <button
                type="button"
                onClick={() => setViewMode('dossier')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-orbitron text-xs transition-colors ${
                  viewMode === 'dossier'
                    ? 'bg-accent/15 text-accent'
                    : 'text-gray-500 hover:text-accent/80 hover:bg-white/5'
                }`}
              >
                <FileText size={12} />
                Dossier View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('terminal')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-orbitron text-xs transition-colors ${
                  viewMode === 'terminal'
                    ? 'bg-accent/15 text-accent'
                    : 'text-gray-500 hover:text-accent/80 hover:bg-white/5'
                }`}
              >
                <Terminal size={12} />
                Terminal View
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs text-gray-400">
              <motion.span
                className="h-2 w-2 rounded-full bg-accent flex-shrink-0"
                style={{
                  boxShadow: '0 0 8px var(--color-accent), 0 0 12px rgba(0,212,255,0.5)',
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="uppercase tracking-wider text-accent/80">Active</span>
            </span>
            <div className="flex items-center gap-1.5">
              {actions.map(({ icon: Icon, label, href, download, onClick }) => (
                <span key={label}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={download}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-accent/90 hover:bg-accent/10 hover:text-accent font-orbitron text-xs transition-colors"
                    >
                      <Icon size={12} />
                      {label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={onClick}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-accent/90 hover:bg-accent/10 hover:text-accent font-orbitron text-xs transition-colors"
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
          {/* Animated cyan underline pulse */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-accent/50"
            style={{
              boxShadow: '0 0 12px rgba(0,212,255,0.4)',
            }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Content area: boot log or dossier/terminal. Single scroll context to avoid nested scroll issues. */}
        <div className="relative w-full aspect-[8/10.5] max-h-[80vh] bg-black/60 min-h-[380px] flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {showBootLog ? (
              <motion.div
                key="boot"
                className="absolute inset-0 flex items-center justify-center z-[0]"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <BootLog onComplete={() => setBootDone(true)} />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                className="absolute inset-0 flex flex-col min-h-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {viewMode === 'terminal' ? (
                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-black/40 overscroll-contain">
                    <TerminalView data={resume.terminalData} />
                  </div>
                ) : (
                  <div className="relative flex-1 min-h-0 overflow-hidden">
                    <Watermark />
                    <iframe
                      src={iframePdfUrl}
                      title="Resume"
                      className="w-full h-full border-0 block relative z-[1]"
                      style={{
                        filter: 'brightness(0.82) contrast(1.05)',
                        minHeight: '100%',
                      }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none z-[2]"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(10,10,20,0.25) 0%, rgba(10,10,20,0.12) 35%, rgba(10,10,20,0.06) 60%, transparent 85%)',
                        mixBlendMode: 'multiply',
                      }}
                    />
                    <Scanlines />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <style>{`
        @keyframes dossier-scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background: 'rgba(5,5,15,0.92)',
              backdropFilter: 'blur(12px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreen(false)}
          >
            <motion.div
              className="relative z-10 w-full max-w-4xl h-[90vh] rounded-xl overflow-hidden flex flex-col min-h-0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow:
                  '0 0 0 1px rgba(0,212,255,0.25), 0 0 60px rgba(0,212,255,0.12), inset 0 1px 0 0 rgba(255,255,255,0.04)',
              }}
            >
              <div className="absolute inset-0 bg-black/40 overflow-hidden">
                <Watermark />
                <iframe
                  src={iframePdfUrl}
                  title="Resume Fullscreen"
                  className="w-full h-full border-0 block relative z-0"
                  style={{ filter: 'brightness(0.82) contrast(1.05)' }}
                />
                <div
                  className="absolute inset-0 pointer-events-none z-[1]"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(10,10,20,0.2) 0%, transparent 50%)',
                    mixBlendMode: 'multiply',
                  }}
                />
                <Scanlines />
              </div>
            </motion.div>
            <button
              type="button"
              aria-label="Close"
              className="fixed top-4 right-4 z-[110] flex items-center justify-center w-10 h-10 rounded-lg bg-black/60 border border-white/10 text-gray-300 hover:text-accent hover:bg-accent/10 hover:border-accent/30 transition-colors"
              onClick={(e) => { e.stopPropagation(); setFullscreen(false) }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
