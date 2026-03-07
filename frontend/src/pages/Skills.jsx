import { Suspense, useRef, useMemo } from 'react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { Pencil, Trash2, Plus, X } from 'lucide-react'

import { useIsAdmin } from '../hooks/useIsAdmin'
import { contentService } from '../services/contentService'
import { adminApi } from '../api/adminApi'
import { publicApi } from '../api/publicApi'
import { useAppStore } from '../store/useAppStore'

const RING_TILT = Math.PI * 0.15
const LERP_FACTOR = 0.09
const ORBIT_HOVER_SCALE = 1.06
const UNRELATED_OPACITY = 0.28
const GLOW_RADIUS = 7
const GLOW_OPACITY_REST = 0.05
const GLOW_OPACITY_ACTIVE = 0.09
const ACCENT_COLOR = '#00d4ff'

// Center node (developer identity): breathing, inner glow, ripple — keep very subtle
const CENTER_BREATH_PERIOD = 4.2
const CENTER_BREATH_SCALE = 0.012
const CENTER_GLOW_OPACITY_MIN = 0.06
const CENTER_GLOW_OPACITY_MAX = 0.14
const CENTER_GLOW_PERIOD = 3.6
const CENTER_RIPPLE_PERIOD = 3.8
const CENTER_RIPPLE_MAX_OPACITY = 0.08

// Skill tag micro-interactions (spring)
const TAG_SPRING = { type: 'spring', stiffness: 360, damping: 28 }
const TAG_HOVER_LIFT_PX = -3
const TAG_HOVER_SCALE = 1.05
const TAG_NEARBY_SHIFT_PX = 2
const TAG_NEARBY_SCALE = 0.99

// Category order inner → outer; each category with skills gets one orbital ring (max 6)
const CATEGORY_ORDER = [
  'Languages and Web Technologies',
  'Frameworks, Libraries & Cloud',
  'Databases & Tools',
  'Machine Learning & AI',
  'Architecture',
]

// Radii and rotation speeds for up to 6 rings (inner faster, outer slower)
const ORBIT_CONFIG = [
  { radius: 2.0, speed: 0.18 },
  { radius: 2.6, speed: 0.13 },
  { radius: 3.2, speed: 0.09 },
  { radius: 3.8, speed: 0.06 },
  { radius: 4.4, speed: 0.04 },
  { radius: 5.0, speed: 0.03 },
]

/** Groups skills by category. Order follows CATEGORY_ORDER; then any other categories. Returns up to 6 groups so at most 6 rings are rendered. Number of rings = number of categories that have skills (capped at 6). */
function groupSkillsByCategory(skills) {
  const byCategory = {}
  skills.forEach((s) => {
    const cat = s.category || 'Other'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(s)
  })
  const ordered = []
  const used = new Set()
  CATEGORY_ORDER.forEach((cat) => {
    if (byCategory[cat] && !used.has(cat)) {
      ordered.push({ category: cat, skills: byCategory[cat] })
      used.add(cat)
    }
  })
  Object.keys(byCategory).forEach((cat) => {
    if (!used.has(cat)) ordered.push({ category: cat, skills: byCategory[cat] })
  })
  return ordered.slice(0, 6)
}

function SkillNode({ skill, position, setHoveredSkillId, targetOpacity, targetScale, isHovered }) {
  const meshRef = useRef()
  const materialRef = useRef()

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return
    const m = materialRef.current
    const s = meshRef.current.scale
    m.opacity += (targetOpacity - m.opacity) * LERP_FACTOR
    const t = targetScale
    s.x += (t - s.x) * LERP_FACTOR
    s.y += (t - s.y) * LERP_FACTOR
    s.z += (t - s.z) * LERP_FACTOR
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHoveredSkillId(skill.id)}
        onPointerOut={() => setHoveredSkillId(null)}
        scale={[1, 1, 1]}
      >
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial
          ref={materialRef}
          color={isHovered ? ACCENT_COLOR : '#00a8cc'}
          transparent
          opacity={targetOpacity}
        />
      </mesh>
    </group>
  )
}

function SingleOrbit({
  categorySkills,
  orbitIndex,
  hoveredSkillId,
  setHoveredSkillId,
  setHoveredCategoryFromRing,
  selectedCategory,
  hoveredCategory,
}) {
  const group = useRef()
  const ringMaterialRef = useRef()
  const { radius, speed } = ORBIT_CONFIG[Math.min(orbitIndex, ORBIT_CONFIG.length - 1)]
  const isSelected = selectedCategory === categorySkills.category
  const isOrbitHovered = hoveredCategory === categorySkills.category
  const targetScale = isOrbitHovered ? ORBIT_HOVER_SCALE : 1
  const targetRingOpacity = isOrbitHovered ? 0.2 : isSelected ? 0.14 : 0.08

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * speed
    const g = group.current
    const t = targetScale
    g.scale.x += (t - g.scale.x) * LERP_FACTOR
    g.scale.y += (t - g.scale.y) * LERP_FACTOR
    g.scale.z += (t - g.scale.z) * LERP_FACTOR
    if (ringMaterialRef.current) {
      const r = ringMaterialRef.current
      r.opacity += (targetRingOpacity - r.opacity) * LERP_FACTOR
    }
  })

  const skills = categorySkills.skills
  const count = skills.length

  return (
    <group ref={group} rotation={[RING_TILT, 0, 0]} scale={[1, 1, 1]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => setHoveredCategoryFromRing(categorySkills.category)}
        onPointerOut={() => setHoveredCategoryFromRing(null)}
      >
        <ringGeometry args={[radius * 0.92, radius * 1.08, 48]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color={ACCENT_COLOR}
          transparent
          opacity={targetRingOpacity}
          side={2}
        />
      </mesh>
      {skills.map((skill, i) => {
        const angle = (i / count) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const isHovered = hoveredSkillId === skill.id
        const inHoveredCategory = !hoveredCategory || categorySkills.category === hoveredCategory
        const targetOpacity = inHoveredCategory ? 1 : UNRELATED_OPACITY
        const targetScale = isHovered ? 1.35 : 1
        return (
          <SkillNode
            key={skill.id}
            skill={skill}
            position={[x, 0, z]}
            setHoveredSkillId={setHoveredSkillId}
            targetOpacity={targetOpacity}
            targetScale={targetScale}
            isHovered={isHovered}
          />
        )
      })}
    </group>
  )
}

const GLOW_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const GLOW_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float falloff = 1.0 - smoothstep(0.3, 1.0, d);
    falloff *= falloff;
    float a = falloff * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`

function AtmosphericGlow({ hasActiveCategory }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(ACCENT_COLOR) },
      uOpacity: { value: GLOW_OPACITY_REST },
    }),
    []
  )
  const currentOpacityRef = useRef(GLOW_OPACITY_REST)

  useFrame(() => {
    const target = hasActiveCategory ? GLOW_OPACITY_ACTIVE : GLOW_OPACITY_REST
    currentOpacityRef.current += (target - currentOpacityRef.current) * LERP_FACTOR
    uniforms.uOpacity.value = currentOpacityRef.current
  })

  return (
    <group rotation={[RING_TILT, 0, 0]} position={[0, 0, -0.4]}>
      <mesh renderOrder={-1}>
        <circleGeometry args={[GLOW_RADIUS, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          uniforms={uniforms}
          vertexShader={GLOW_VERTEX}
          fragmentShader={GLOW_FRAGMENT}
        />
      </mesh>
    </group>
  )
}

function CenterNode() {
  const groupRef = useRef()
  const glowMatRef = useRef()
  const rippleRef = useRef()
  const rippleMatRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!groupRef.current) return

    // Slow breathing pulse
    const breath = 1 + Math.sin(t * (Math.PI * 2) / CENTER_BREATH_PERIOD) * CENTER_BREATH_SCALE
    groupRef.current.scale.setScalar(breath)

    // Inner glow fluctuation (3–4 s cycle)
    if (glowMatRef.current) {
      const glowPhase = (Math.sin(t * (Math.PI * 2) / CENTER_GLOW_PERIOD) + 1) * 0.5
      glowMatRef.current.opacity =
        CENTER_GLOW_OPACITY_MIN + glowPhase * (CENTER_GLOW_OPACITY_MAX - CENTER_GLOW_OPACITY_MIN)
    }

    // Single ripple wave, one expansion every CENTER_RIPPLE_PERIOD seconds
    if (rippleRef.current && rippleMatRef.current) {
      const phase = (t % CENTER_RIPPLE_PERIOD) / CENTER_RIPPLE_PERIOD
      const scale = 0.35 + phase * 0.6
      rippleRef.current.scale.setScalar(scale)
      rippleMatRef.current.opacity = (1 - phase) * CENTER_RIPPLE_MAX_OPACITY
    }
  })

  return (
    <group ref={groupRef} rotation={[RING_TILT, 0, 0]} scale={[1, 1, 1]}>
      {/* Faint expanding ripple */}
      <mesh ref={rippleRef} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-2}>
        <ringGeometry args={[0.25, 0.32, 32]} />
        <meshBasicMaterial
          ref={rippleMatRef}
          color={ACCENT_COLOR}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Inner glow layer */}
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial
          ref={glowMatRef}
          color={ACCENT_COLOR}
          transparent
          opacity={CENTER_GLOW_OPACITY_MIN}
          depthWrite={false}
        />
      </mesh>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshBasicMaterial color={ACCENT_COLOR} />
      </mesh>
    </group>
  )
}

function HierarchicalOrbits({
  skillsByOrbit,
  hoveredSkillId,
  setHoveredSkillId,
  setHoveredCategoryFromRing,
  selectedCategory,
  hoveredCategory,
}) {
  const hasActiveCategory = !!(hoveredCategory || selectedCategory)
  return (
    <>
      <AtmosphericGlow hasActiveCategory={hasActiveCategory} />
      <CenterNode />
      {skillsByOrbit.map((catSkills, i) => (
        <SingleOrbit
          key={catSkills.category}
          categorySkills={catSkills}
          orbitIndex={i}
          hoveredSkillId={hoveredSkillId}
          setHoveredSkillId={setHoveredSkillId}
          setHoveredCategoryFromRing={setHoveredCategoryFromRing}
          selectedCategory={selectedCategory}
          hoveredCategory={hoveredCategory}
        />
      ))}
    </>
  )
}

function SkillsScene({
  skills,
  hoveredSkillId,
  setHoveredSkillId,
  hoveredCategoryFromRing,
  setHoveredCategoryFromRing,
  selectedCategory,
  hoveredCategory,
  onContextLost,
  onContextRestored,
}) {
  const skillsByOrbit = useMemo(() => groupSkillsByCategory(skills), [skills])

  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 48 }}
      gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement
        canvas.addEventListener(
          'webglcontextlost',
          (e) => {
            e.preventDefault()
            onContextLost?.()
          },
          false
        )
        canvas.addEventListener('webglcontextrestored', () => onContextRestored?.(), false)
      }}
    >
      <Suspense fallback={null}>
        <HierarchicalOrbits
          skillsByOrbit={skillsByOrbit}
          hoveredSkillId={hoveredSkillId}
          setHoveredSkillId={setHoveredSkillId}
          setHoveredCategoryFromRing={setHoveredCategoryFromRing}
          selectedCategory={selectedCategory}
          hoveredCategory={hoveredCategory}
        />
      </Suspense>
    </Canvas>
  )
}

const inputClass = 'w-full px-3 py-2 rounded-lg bg-void/80 border border-glass-border text-white font-space text-sm focus:border-accent/50 focus:outline-none'
const labelClass = 'block text-xs text-gray-500 font-orbitron mb-1'

function SkillFormModal({ skill, categories, onClose, onSaved }) {
  const isEdit = skill != null
  const initialCategoryId = () => {
    if (skill?.categoryId != null) return String(skill.categoryId)
    if (skill?.category && Array.isArray(categories)) {
      const byName = categories.find((c) => c.name === skill.category)
      if (byName?.id != null) return String(byName.id)
    }
    return categories?.[0]?.id != null ? String(categories[0].id) : ''
  }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => ({
    name: skill?.name ?? '',
    categoryId: initialCategoryId(),
  }))

  useEffect(() => {
    const next = initialCategoryId()
    if (next && form.categoryId !== next) setForm((f) => ({ ...f, categoryId: next }))
  }, [skill?.categoryId, skill?.category, categories])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const categoryId = form.categoryId ? Number(form.categoryId) : null
    if (!categoryId && !isEdit) {
      setError('Select a category')
      setSaving(false)
      return
    }
    try {
      if (isEdit) {
        await adminApi.updateSkill(skill.id, { name: form.name.trim(), categoryId: categoryId || undefined })
      } else {
        await adminApi.createSkill({ name: form.name.trim(), categoryId })
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
        className="relative rounded-xl border border-glass-border bg-panel-bg/98 backdrop-blur-md w-full max-w-md max-h-[90vh] flex flex-col my-auto shrink-0"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <span className="font-orbitron text-accent">{isEdit ? 'Edit skill' : 'Add skill'}</span>
          <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded text-gray-400 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 min-h-0">
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} required />
          </div>
          <div className="overflow-visible">
            <label className={labelClass}>Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className={`${inputClass} pr-10 appearance-none bg-no-repeat bg-[length:1rem_1rem] bg-[right_0.5rem_center]`}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
              required={!isEdit}
            >
              <option value="">— Select category —</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
            {categories?.length === 0 && (
              <p className="text-amber-500/90 text-xs mt-1">Loading categories…</p>
            )}
          </div>
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2">
              <p className="text-red-400 text-sm font-medium">Request failed</p>
              <p className="text-red-300/90 text-sm mt-0.5">{error}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-orbitron text-sm hover:bg-accent/30 disabled:opacity-50">{saving ? 'Saving…' : (isEdit ? 'Save' : 'Create')}</button>
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 rounded-lg border border-glass-border text-gray-400 font-orbitron text-sm hover:text-white">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
  return createPortal(modal, document.body)
}

export default function Skills() {
  const sectionRef = useRef(null)
  const orbitInView = useInView(sectionRef, { amount: 0.2, once: false })
  const isAdmin = useIsAdmin()
  const refetchBootstrap = useAppStore((s) => s.refetchBootstrap)
  const [skills, setSkills] = useState([])
  const [categories, setCategories] = useState([])
  const [skillForm, setSkillForm] = useState(null)
  const [hoveredSkillId, setHoveredSkillId] = useState(null)
  const [hoveredCategoryFromRing, setHoveredCategoryFromRing] = useState(null)
  const [hoveredCategoryFromPill, setHoveredCategoryFromPill] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [webglContextLost, setWebglContextLost] = useState(false)
  const [orbitRemountKey, setOrbitRemountKey] = useState(0)
  const skillsByOrbit = useMemo(() => groupSkillsByCategory(skills), [skills])
  const skillIdToCategory = useMemo(() => {
    const m = {}
    skills.forEach((s) => { m[s.id] = s.category })
    return m
  }, [skills])
  const hoveredCategory =
    hoveredCategoryFromPill ||
    hoveredCategoryFromRing ||
    (hoveredSkillId ? skillIdToCategory[hoveredSkillId] : null)

  const refreshSkills = async () => {
    await refetchBootstrap()
    const next = await contentService.getSkills()
    setSkills(Array.isArray(next) ? next : [])
  }

  useEffect(() => {
    contentService.getSkills().then((next) => setSkills(Array.isArray(next) ? next : []))
  }, [])

  // Load categories when admin; if empty, seed from frontend then reload
  useEffect(() => {
    if (!isAdmin) return
    publicApi
      .getSkillCategories()
      .then((next) => setCategories(Array.isArray(next) ? next : []))
      .catch(() => setCategories([]))
  }, [isAdmin])

  // When categories are empty and modal is open (or we're admin), seed from frontend then fetch
  useEffect(() => {
    if (!isAdmin || categories.length > 0) return
    adminApi
      .seedSkillCategories()
      .then(() => publicApi.getSkillCategories())
      .then((next) => setCategories(Array.isArray(next) ? next : []))
      .catch(() => {})
  }, [isAdmin, categories.length])

  // When Add/Edit skill modal opens, refetch categories so dropdown is fresh
  useEffect(() => {
    if (isAdmin && skillForm != null) {
      publicApi
        .getSkillCategories()
        .then((next) => setCategories(Array.isArray(next) ? next : []))
        .catch(() => {})
    }
  }, [isAdmin, skillForm])

  const handleDeleteSkill = async (skill) => {
    if (!window.confirm(`Delete skill "${skill.name}"?`)) return
    try {
      await adminApi.deleteSkill(skill.id)
      await refreshSkills()
    } catch (e) {
      window.alert(e?.message ?? 'Delete failed')
    }
  }

  return (
    <motion.div
      ref={sectionRef}
      className="max-w-4xl mx-auto px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-2">
            Skills
          </h1>
          <p className="text-gray-400 font-exo text-base mb-8">
            Developer Core — Skills in Active Orbit
          </p>
        </div>
        {isAdmin && (
          <button type="button" onClick={() => setSkillForm('add')} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/40 text-accent/90 font-orbitron text-sm hover:bg-accent/10 shrink-0">
            <Plus size={14} /> Add skill
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="relative w-full h-[min(280px,75vmin)] max-h-[75vmin] shrink-0 overflow-hidden rounded-2xl md:h-auto md:max-h-none md:aspect-square md:min-h-[280px]">
          <div className="absolute inset-0 w-full h-full">
            {skills.length > 0 && orbitInView && !webglContextLost ? (
              <SkillsScene
                key={orbitRemountKey}
                skills={skills}
                hoveredSkillId={hoveredSkillId}
                setHoveredSkillId={setHoveredSkillId}
                hoveredCategoryFromRing={hoveredCategoryFromRing}
                setHoveredCategoryFromRing={setHoveredCategoryFromRing}
                selectedCategory={selectedCategory}
                hoveredCategory={hoveredCategory}
                onContextLost={() => setWebglContextLost(true)}
                onContextRestored={() => setWebglContextLost(false)}
              />
            ) : skills.length > 0 && webglContextLost ? (
              <div className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-4 p-4 text-center border border-white/10 bg-black/30">
                <p className="text-gray-400 font-space text-sm">
                  Orbit view paused (GPU context lost). This can happen when the tab was in the background or on some mobile devices.
                </p>
                <button
                  type="button"
                  onClick={() => { setWebglContextLost(false); setOrbitRemountKey((k) => k + 1) }}
                  className="px-4 py-2 rounded-lg bg-accent/20 border border-accent/50 text-accent font-orbitron text-sm hover:bg-accent/30 transition-colors"
                >
                  Try again
                </button>
                <p className="text-gray-500 font-space text-xs">If it still fails, refresh the page.</p>
              </div>
            ) : skills.length > 0 && !orbitInView ? (
              <div className="w-full h-full rounded-2xl flex items-center justify-center text-gray-500 font-space text-sm border border-white/10 bg-black/20">
                Scroll into view to load orbit
              </div>
            ) : (
              <div className="w-full h-full rounded-2xl flex items-center justify-center text-gray-500 font-space">
                Loading...
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          {skillsByOrbit.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="sr-only">Filter by category</span>
              {skillsByOrbit.map(({ category }) => {
                const isCategoryHighlighted = selectedCategory === category || hoveredCategory === category
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory((c) => (c === category ? null : category))}
                    onMouseEnter={() => setHoveredCategoryFromPill(category)}
                    onMouseLeave={() => setHoveredCategoryFromPill(null)}
                    className={`px-3 py-2 rounded-lg text-sm font-space tracking-wide transition-colors duration-200 ${
                      isCategoryHighlighted
                        ? 'bg-accent/20 text-accent border border-accent/40'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const isTagHighlighted = hoveredSkillId === skill.id || hoveredCategory === skill.category
              const isHovered = hoveredSkillId === skill.id
              const isNearby =
                hoveredSkillId &&
                skillIdToCategory[hoveredSkillId] === skill.category &&
                !isHovered
              return (
                <motion.span
                  key={skill.id}
                  title={skill.category}
                  className="px-3 py-2 rounded-lg border font-exo text-base transition-colors duration-300 cursor-default inline-flex items-center gap-2"
                  style={{
                    borderColor: isTagHighlighted ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255,255,255,0.1)',
                    backgroundColor: isTagHighlighted ? 'rgba(0, 212, 255, 0.08)' : 'rgba(10, 10, 15, 0.8)',
                    color: isTagHighlighted ? '#00d4ff' : hoveredCategory ? '#6b7280' : '#e2e8f0',
                    opacity: hoveredCategory && !isTagHighlighted ? 0.6 : 1,
                  }}
                  animate={{
                    y: isHovered ? TAG_HOVER_LIFT_PX : isNearby ? TAG_NEARBY_SHIFT_PX : 0,
                    scale: isHovered ? TAG_HOVER_SCALE : isNearby ? TAG_NEARBY_SCALE : 1,
                  }}
                  transition={TAG_SPRING}
                  onMouseEnter={() => setHoveredSkillId(skill.id)}
                  onMouseLeave={() => setHoveredSkillId(null)}
                >
                  {skill.name}
                  {isAdmin && (
                    <span className="flex items-center gap-1 opacity-80" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => setSkillForm(skill)} className="p-1 rounded hover:text-accent hover:bg-accent/10" aria-label={`Edit ${skill.name}`}><Pencil size={12} /></button>
                      <button type="button" onClick={() => handleDeleteSkill(skill)} className="p-1 rounded hover:text-red-400 hover:bg-red-500/10" aria-label={`Delete ${skill.name}`}><Trash2 size={12} /></button>
                    </span>
                  )}
                </motion.span>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {skillForm && (
          <SkillFormModal
            skill={skillForm === 'add' ? null : skillForm}
            categories={categories}
            onClose={() => setSkillForm(null)}
            onSaved={async () => { await refreshSkills(); setSkillForm(null) }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
