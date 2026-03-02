import { Suspense, useRef, useMemo } from 'react'
import { useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion } from 'framer-motion'
import * as THREE from 'three'

import { contentService } from '../services/contentService'

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

// Category order inner → outer; each gets one orbital ring
const CATEGORY_ORDER = ['Language', 'Languages', 'Data', 'Backend', 'Frontend', 'DevOps', 'Infrastructure', 'Core Engineering']

// Radii and rotation speeds (inner faster, outer slower)
const ORBIT_CONFIG = [
  { radius: 2.0, speed: 0.18 },
  { radius: 2.6, speed: 0.13 },
  { radius: 3.2, speed: 0.09 },
  { radius: 3.8, speed: 0.06 },
  { radius: 4.4, speed: 0.04 },
]

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
  return ordered.slice(0, 5)
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
}) {
  const skillsByOrbit = useMemo(() => groupSkillsByCategory(skills), [skills])

  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 48 }}
      gl={{ antialias: true, alpha: true }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'transparent' }}
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

export default function Skills() {
  const [skills, setSkills] = useState([])
  const [hoveredSkillId, setHoveredSkillId] = useState(null)
  const [hoveredCategoryFromRing, setHoveredCategoryFromRing] = useState(null)
  const [hoveredCategoryFromPill, setHoveredCategoryFromPill] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
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

  useEffect(() => {
    contentService.getSkills().then(setSkills)
  }, [])

  return (
    <motion.div
      className="max-w-4xl mx-auto px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-2">
        Skills
      </h1>
      <p className="text-gray-400 font-exo text-base mb-8">
        Developer Core — Skills in Active Orbit
      </p>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="aspect-square min-h-[280px]">
          {skills.length > 0 ? (
            <SkillsScene
              skills={skills}
              hoveredSkillId={hoveredSkillId}
              setHoveredSkillId={setHoveredSkillId}
              hoveredCategoryFromRing={hoveredCategoryFromRing}
              setHoveredCategoryFromRing={setHoveredCategoryFromRing}
              selectedCategory={selectedCategory}
              hoveredCategory={hoveredCategory}
            />
          ) : (
            <div className="w-full h-full rounded-2xl flex items-center justify-center text-gray-500 font-space">
              Loading...
            </div>
          )}
        </div>
        <div className="space-y-4">
          {skillsByOrbit.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skillsByOrbit.map(({ category }) => {
                const isCategoryHighlighted = selectedCategory === category || hoveredCategory === category
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory((c) => (c === category ? null : category))}
                    onMouseEnter={() => setHoveredCategoryFromPill(category)}
                    onMouseLeave={() => setHoveredCategoryFromPill(null)}
                    className={`px-2.5 py-1 rounded font-space text-xs uppercase tracking-wider transition-colors duration-200 ${
                      isCategoryHighlighted
                        ? 'bg-accent/20 text-accent border border-accent/40'
                        : 'bg-white/5 text-gray-500 border border-white/10 hover:border-white/20'
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
                className="px-3 py-2 rounded-lg border font-exo text-base transition-colors duration-300 cursor-default inline-block"
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
                <span className="text-gray-500 text-sm ml-1">({skill.category})</span>
              </motion.span>
            )
          })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
