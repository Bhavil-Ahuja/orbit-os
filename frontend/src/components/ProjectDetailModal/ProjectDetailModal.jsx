import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, ExternalLink, Pencil, Trash2 } from 'lucide-react'

export default function ProjectDetailModal({ project, onClose, isAdmin, onEdit, onDelete }) {
  useEffect(() => {
    if (!project) return
    const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [project, onClose])

  if (!project) return null

  const hasArch = project.architectureOverview != null
  const designDecisions = Array.isArray(project.designDecisions) ? project.designDecisions : []
  const technicalChallenges = Array.isArray(project.technicalChallenges) ? project.technicalChallenges : []
  const screenshots = Array.isArray(project.screenshots) ? project.screenshots : []

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
        aria-labelledby="project-detail-title"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden
        />
        <motion.div
          className="relative rounded-2xl border border-glass-border bg-panel-bg/98 backdrop-blur-md shadow-panel w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col my-auto shrink-0"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-white/10 flex-shrink-0 flex-wrap">
            <h2
              id="project-detail-title"
              className="font-orbitron text-xl text-accent"
              style={{ textShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}
            >
              {project.title}
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
            {hasArch && (
              <section>
                <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-2">
                  ARCHITECTURE OVERVIEW
                </div>
                <p className="font-exo text-gray-200 text-sm leading-relaxed">
                  {project.architectureOverview}
                </p>
              </section>
            )}

            {designDecisions.length > 0 && (
              <section>
                <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-2">
                  DESIGN DECISIONS
                </div>
                <ul className="font-exo text-gray-200 text-sm leading-relaxed space-y-1.5 list-none">
                  {designDecisions.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent/80 shrink-0">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {technicalChallenges.length > 0 && (
              <section>
                <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-2">
                  TECHNICAL CHALLENGES
                </div>
                <ul className="font-exo text-gray-200 text-sm leading-relaxed space-y-1.5 list-none">
                  {technicalChallenges.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent/80 shrink-0">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {screenshots.length > 0 && (
              <section>
                <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-2">
                  SCREENSHOTS
                </div>
                <div className="flex flex-wrap gap-2">
                  {screenshots.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="rounded-lg max-h-40 object-cover border border-white/10"
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {project.techStack?.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md bg-accent/10 text-accent/90 font-exo text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-4 pt-2 border-t border-white/10">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-accent font-exo text-sm transition-colors"
              >
                <Github size={16} /> GitHub
              </a>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-accent font-exo text-sm transition-colors"
              >
                <ExternalLink size={16} /> Live demo
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
