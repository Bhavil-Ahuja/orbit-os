import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Github, ExternalLink, Plus, Pencil, Trash2, X } from 'lucide-react'
import { contentService } from '../services/contentService'
import { useMouseTilt } from '../hooks/useMouseTilt'
import { useAppStore } from '../store/useAppStore'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { adminApi } from '../api/adminApi'
import { publicApi } from '../api/publicApi'
import ProjectDetailModal from '../components/ProjectDetailModal/ProjectDetailModal'
import SortableList from '../components/SortableList/SortableList'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [modulesLoaded, setModulesLoaded] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectForm, setProjectForm] = useState(null) // null | 'add' | project (edit)
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.05 })
  const activeSection = useAppStore((s) => s.activeSection)
  const isProjectsActive = activeSection === 'projects'

  const isAdmin = useIsAdmin()
  const refetchBootstrap = useAppStore((s) => s.refetchBootstrap)

  const refreshProjects = async () => {
    try {
      await refetchBootstrap()
      const next = await publicApi.getProjects()
      setProjects(Array.isArray(next) ? next : [])
    } catch (_) {
      const next = await contentService.getProjects().then((d) => (Array.isArray(d) ? d : [])).catch(() => [])
      setProjects(Array.isArray(next) ? next : [])
    }
  }

  useEffect(() => {
    contentService.getProjects().then((next) => setProjects(Array.isArray(next) ? next : []))
  }, [])

  useEffect(() => {
    if (!isProjectsActive) return
    const t = setTimeout(() => setModulesLoaded(true), 1400)
    return () => clearTimeout(t)
  }, [isProjectsActive])

  const handleDelete = async (project) => {
    if (!isAdmin || !window.confirm(`Delete "${project.title}"?`)) return
    try {
      await adminApi.deleteProject(project.id)
      await refreshProjects()
      if (selectedProject?.id === project.id) setSelectedProject(null)
    } catch (e) {
      window.alert(e?.message ?? 'Delete failed')
    }
  }

  return (
    <motion.div
      ref={sectionRef}
      className={`relative max-w-6xl mx-auto px-6 py-8 ${!modulesLoaded ? 'min-h-[min(100vh,900px)]' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Reduced ambient glow so cards dominate */}
      <div
        className="absolute inset-0 -mx-4 -my-4 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0, 212, 255, 0.045) 0%, transparent 70%)',
          boxShadow: 'inset 0 0 60px rgba(0, 212, 255, 0.02)',
        }}
        aria-hidden
      />

      <AnimatePresence>
        {isProjectsActive && !modulesLoaded && (
          <motion.div
            key="loading-modules"
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none min-h-[200px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="font-space text-accent/90 text-sm flex items-center gap-2">
              <span className="text-green-500/80">&gt;</span>
              Loading Mission Modules...
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

      {(inView || isProjectsActive) && modulesLoaded && (
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
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-2" style={{ textShadow: 'none' }}>
              Projects
            </h1>
            <p className="text-gray-400 font-exo text-base mb-6">
              Mission modules
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setProjectForm('add')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-sm hover:bg-accent/10 transition-colors shrink-0"
            >
              <Plus size={16} /> Add project
            </button>
          )}
        </div>

        <SortableList
          items={projects}
          getId={(p) => p.id}
          onReorder={async (orderedIds) => {
            await adminApi.reorderProjects(orderedIds)
            await refreshProjects()
          }}
          isAdmin={isAdmin}
          layout="grid"
        >
          {(project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              inView={(inView || isProjectsActive) && modulesLoaded}
              onSelect={setSelectedProject}
              isAdmin={isAdmin}
              onEdit={() => setProjectForm(project)}
              onDelete={() => handleDelete(project)}
            />
          )}
        </SortableList>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            isAdmin={isAdmin}
            onEdit={() => { setSelectedProject(null); setProjectForm(selectedProject) }}
            onDelete={() => handleDelete(selectedProject)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {projectForm && (
          <ProjectFormModal
            project={projectForm === 'add' ? null : projectForm}
            onClose={() => setProjectForm(null)}
            onSaved={async () => { await refreshProjects(); setProjectForm(null) }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ProjectCard({ project, index, inView, onSelect, isAdmin, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const { ref: tiltRef, style: tiltStyle, mousePos, handleMouseMove, handleMouseLeave } = useMouseTilt({
    maxTilt: 6,
    perspective: 1000,
  })
  const isFlagship = project.flagship === true

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeaveCard = () => {
    setHovered(false)
    handleMouseLeave()
  }
  const handleCardClick = () => onSelect?.(project)
  const handleEditClick = (e) => { e.stopPropagation(); onEdit?.() }
  const handleDeleteClick = (e) => { e.stopPropagation(); onDelete?.() }

  const hasSystemMeta = project.status != null || project.type != null || project.role != null || project.scale != null
  const hasImpactFirst = project.missionObjective != null && Array.isArray(project.impact) && project.impact.length > 0
  const impactList = hasImpactFirst ? project.impact : []
  const missionStatement = project.missionObjective ?? project.description ?? ''

  return (
    <motion.div
      ref={tiltRef}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleCardClick : undefined}
      onKeyDown={onSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } } : undefined}
      className={`relative rounded-2xl overflow-visible h-full ${onSelect ? 'cursor-pointer' : ''}`}
      style={tiltStyle}
      initial={{ opacity: 0, y: 24, scale: isFlagship ? 0.98 : 0.96 }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              scale: isFlagship ? 1.04 : 1,
              transition: {
                delay: 0.4 + index * 0.12,
                duration: 0.5,
                ease: [0.22, 0.61, 0.36, 1],
              },
            }
          : {}
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeaveCard}
    >
      <motion.div
        className="h-full"
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 4 + index * 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <motion.div
          className="relative rounded-2xl border border-glass-border bg-panel-bg/95 backdrop-blur-md overflow-hidden h-full flex flex-col"
          style={
            isFlagship
              ? { borderColor: 'rgba(0, 212, 255, 0.3)', background: 'linear-gradient(180deg, rgba(0, 212, 255, 0.03) 0%, rgba(2, 6, 23, 0.95) 30%)' }
              : undefined
          }
          animate={{
            y: hovered ? -4 : 0,
            borderColor: isFlagship ? 'rgba(0, 212, 255, 0.35)' : hovered ? 'rgba(0, 212, 255, 0.25)' : 'rgba(255,255,255,0.07)',
            boxShadow: hovered
              ? '0 0 0 1px rgba(0, 212, 255, 0.2), 0 20px 40px -12px rgba(0, 0, 0, 0.4)'
              : '0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px -12px rgba(0, 0, 0, 0.4)',
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 70%, rgba(0,212,255,0.02) 100%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-[250ms]"
            style={{
              opacity: hovered ? 1 : 0,
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)`,
            }}
            aria-hidden
          />

          <div className="relative p-5 md:p-6 flex flex-col flex-1 min-h-0">
            {/* Title — no glow, consistent with Publications / Experience */}
            <h3 className="font-orbitron text-lg md:text-xl text-accent mb-1.5 flex-shrink-0" style={{ textShadow: 'none' }}>
              {project.title}
            </h3>

            {/* Metadata — 65–70% opacity, slightly smaller; title stays primary */}
            {hasSystemMeta && (
              <div className="font-space text-[11px] text-gray-500 mb-2 flex flex-wrap gap-x-3 gap-y-0.5 opacity-[0.68]">
                {project.status != null && <span><span className="text-gray-600">STATUS</span> {project.status}</span>}
                {project.type != null && <span><span className="text-gray-600">TYPE</span> {project.type}</span>}
                {project.role != null && <span><span className="text-gray-600">ROLE</span> {project.role}</span>}
                {project.scale != null && <span><span className="text-gray-600">SCALE</span> {project.scale}</span>}
              </div>
            )}

            {/* MISSION OBJECTIVE + IMPACT — tighter spacing */}
            {hasImpactFirst ? (
              <>
                <div className="mb-2">
                  <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-0.5">MISSION OBJECTIVE</div>
                  <p className="font-exo text-gray-300 text-sm leading-relaxed">{missionStatement}</p>
                </div>
                <div className="mb-3 flex-1 min-h-0">
                  <div className="font-space text-gray-500 text-xs uppercase tracking-wider mb-1">IMPACT</div>
                  <ul className="font-exo text-sm leading-relaxed space-y-0.5 list-none">
                    {impactList.map((line, j) => (
                      <li key={j} className="flex gap-2 text-gray-200">
                        <span className="text-accent/90 shrink-0">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-gray-300 font-exo text-sm leading-relaxed mb-3 flex-1 opacity-80">
                {missionStatement}
              </p>
            )}

            {/* Tech tags — slightly dimmer base, brighten on hover */}
            <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-white/10">
              {project.techStack?.map((tech) => (
                <motion.span
                  key={tech}
                  className="px-2.5 py-0.5 rounded-md bg-accent/10 font-exo text-xs text-accent/80"
                  animate={{
                    opacity: hovered ? 1 : 0.7,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2.5" onClick={(e) => e.stopPropagation()}>
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
              {isAdmin && (
                <>
                  <button type="button" onClick={handleEditClick} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-accent font-exo text-sm transition-colors">
                    <Pencil size={14} /> Edit
                  </button>
                  <button type="button" onClick={handleDeleteClick} className="inline-flex items-center gap-1.5 text-red-400/80 hover:text-red-400 font-exo text-sm transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const PROJECT_STATUS_OPTIONS = ['OPERATIONAL', 'COMPLETED', 'ARCHIVED', 'PROTOTYPE']
const PROJECT_TYPE_OPTIONS = ['Personal', 'Console / Portfolio', 'Commerce', 'Internal Tooling', 'Open Source', 'Other']

const inputClass = 'w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none'
const labelClass = 'block text-xs text-gray-500 font-orbitron mb-1'

function ProjectFormModal({ project, onClose, onSaved }) {
  const isEdit = project != null
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => ({
    title: project?.title ?? '',
    slug: project?.slug ?? '',
    status: project?.status ?? 'DRAFT',
    type: project?.type ?? 'Personal',
    role: project?.role ?? '',
    scale: project?.scale ?? '',
    missionObjective: project?.missionObjective ?? '',
    impact: Array.isArray(project?.impact) ? project.impact.join('\n') : '',
    techStack: Array.isArray(project?.techStack) ? project.techStack.join(', ') : '',
    githubUrl: project?.githubUrl ?? '',
    liveUrl: project?.liveUrl ?? '',
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        status: form.status.trim() || undefined,
        type: form.type.trim(),
        role: form.role.trim(),
        scale: form.scale.trim(),
        missionObjective: form.missionObjective.trim(),
        impact: form.impact.split(/\n/).map((s) => s.trim()).filter(Boolean),
        techStack: form.techStack.split(/[,;]/).map((s) => s.trim()).filter(Boolean),
        githubUrl: form.githubUrl.trim() || undefined,
        liveUrl: form.liveUrl.trim() || undefined,
      }
      if (isEdit) {
        await adminApi.updateProject(project.id, payload)
      } else {
        await adminApi.createProject(payload)
      }
      await onSaved()
    } catch (e) {
      setError(e?.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const modal = (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !saving && onClose()}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
      <motion.div
        className="relative rounded-xl border border-glass-border bg-panel-bg/98 backdrop-blur-md w-full max-w-lg max-h-[90vh] flex flex-col my-auto shrink-0"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 bg-panel-bg/98">
          <span className="font-orbitron text-accent">{isEdit ? 'Edit project' : 'Add project'}</span>
          <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded text-gray-400 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto min-h-0 flex-1">
          <div>
            <label className={labelClass}>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputClass}>
              {[...new Set([...PROJECT_TYPE_OPTIONS, form.type].filter(Boolean))].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
              {[...new Set([...PROJECT_STATUS_OPTIONS, form.status].filter(Boolean))].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <input type="text" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Scale</label>
            <input type="text" value={form.scale} onChange={(e) => setForm((f) => ({ ...f, scale: e.target.value }))} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Mission objective</label>
            <textarea
              value={form.missionObjective}
              onChange={(e) => setForm((f) => ({ ...f, missionObjective: e.target.value }))}
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className={labelClass}>Impact (one per line)</label>
            <textarea value={form.impact} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))} rows={3} className={`${inputClass} resize-y`} />
          </div>
          <div>
            <label className={labelClass}>Tech stack (comma-separated)</label>
            <input type="text" value={form.techStack} onChange={(e) => setForm((f) => ({ ...f, techStack: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input type="url" value={form.githubUrl} onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Live URL</label>
            <input type="url" value={form.liveUrl} onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))} className={inputClass} />
          </div>
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2">
              <p className="text-red-400 text-sm font-medium">Request failed</p>
              <p className="text-red-300/90 text-sm mt-0.5">{error}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-orbitron text-sm hover:bg-accent/30 disabled:opacity-50">
              {saving ? 'Saving…' : (isEdit ? 'Save' : 'Create')}
            </button>
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 rounded-lg border border-glass-border text-gray-400 font-orbitron text-sm hover:text-white">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
  return createPortal(modal, document.body)
}
