import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'

export default function PublicationDetailModal({ publication, onClose }) {
  useEffect(() => {
    if (!publication) return
    const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [publication, onClose])

  if (!publication) return null

  const { title, authors, venue, year, url, description } = publication

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
        aria-labelledby="publication-detail-title"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden
        />
        <motion.div
          className="relative rounded-2xl border border-white/10 bg-black/90 backdrop-blur-md w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          style={{ boxShadow: '0 0 0 1px rgba(0,212,255,0.15), 0 24px 48px -12px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
            <h2
              id="publication-detail-title"
              className="font-orbitron text-xl text-accent"
              style={{ textShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {(authors || venue || year) && (
              <section>
                <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-2">
                  CITATION
                </div>
                <div className="font-exo text-gray-200 text-sm leading-relaxed space-y-1">
                  {authors && <p>{authors}</p>}
                  {(venue || year) && (
                    <p className="text-gray-400">
                      {[venue, year].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </section>
            )}

            {description && (
              <section>
                <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-2">
                  ABSTRACT
                </div>
                <p className="font-exo text-gray-200 text-sm leading-relaxed">
                  {description}
                </p>
              </section>
            )}

            {url && (
              <div className="pt-2 border-t border-white/10">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-accent hover:text-accent/80 font-exo text-sm transition-colors"
                >
                  <ExternalLink size={16} />
                  View publication
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
