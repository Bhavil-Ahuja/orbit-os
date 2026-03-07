import { Suspense, useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

const BURST_DURATION_MS = 200
const BURST_SPEED = 1.8
const NORMAL_SPEED = 0.2
const SECTION_TRANSITION_SPEED = 0.05

// Section → vertical focus offset (transform only). About = top, stay-in-touch = bottom.
const SECTION_FOCUS_OFFSET = {
  'about': -12,
  'experience': -7,
  'projects': -2,
  'publications': 0,
  'skills': 2,
  'resume': 7,
  'stay-in-touch': 12,
}

// Section → [x, y] camera parallax offset (world units). Lerped each frame.
const SECTION_PARALLAX = {
  'about': [0, -0.4],
  'experience': [0.12, -0.22],
  'projects': [0.06, 0],
  'publications': [0.02, 0.02],
  'skills': [-0.06, 0.1],
  'resume': [-0.14, 0.2],
  'stay-in-touch': [0, 0.35],
}

// Section → [x%, y%] nebula background position shift (transform).
const SECTION_NEBULA_OFFSET = {
  'about': [0, -3],
  'experience': [1.5, -1.5],
  'projects': [1, 0],
  'publications': [0.5, 0.5],
  'skills': [-1, 1],
  'resume': [-2, 2],
  'stay-in-touch': [0, 3],
}

const PARALLAX_LERP = 0.028

function CameraDrift() {
  const group = useRef()
  const offsetRef = useRef({ x: 0, y: 0 })
  const bootInProgress = useAppStore((s) => s.bootInProgress)
  const sectionTransitioning = useAppStore((s) => s.sectionTransitioning)
  useFrame((state) => {
    if (!group.current) return
    if (bootInProgress) return
    const activeSection = useAppStore.getState().activeSection
    const bootComplete = useAppStore.getState().bootComplete
    const [tx, ty] = bootComplete ? (SECTION_PARALLAX[activeSection] ?? [0, 0]) : [0, 0]
    const o = offsetRef.current
    o.x += (tx - o.x) * PARALLAX_LERP
    o.y += (ty - o.y) * PARALLAX_LERP
    const driftScale = sectionTransitioning ? 0.25 : 1
    const t = state.clock.elapsedTime * 0.05 * driftScale
    state.camera.position.x = Math.sin(t) * 2 + o.x
    state.camera.position.y = Math.cos(t * 0.7) * 1.5 + o.y
    state.camera.lookAt(0, 0, 0)
    state.camera.updateProjectionMatrix()
  })
  return <group ref={group} />
}

function DepthFog() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.028)
    return () => {
      scene.fog = null
    }
  }, [scene])
  return null
}

function Starfield() {
  const bootInProgress = useAppStore((s) => s.bootInProgress)
  const sectionTransitioning = useAppStore((s) => s.sectionTransitioning)
  const [burstActive, setBurstActive] = useState(false)
  const prevBoot = useRef(bootInProgress)

  useEffect(() => {
    const wasBooting = prevBoot.current
    prevBoot.current = bootInProgress
    if (wasBooting && !bootInProgress) {
      setBurstActive(true)
      const t = setTimeout(() => setBurstActive(false), BURST_DURATION_MS)
      return () => clearTimeout(t)
    }
  }, [bootInProgress])

  const speed = bootInProgress
    ? 0
    : burstActive
      ? BURST_SPEED
      : sectionTransitioning
        ? SECTION_TRANSITION_SPEED
        : NORMAL_SPEED
  return (
    <Stars
      radius={300}
      depth={80}
      count={4000}
      factor={4}
      saturation={0.5}
      fade
      speed={speed}
    />
  )
}

export default function SpaceBackground() {
  const bootInProgress = useAppStore((s) => s.bootInProgress)
  const bootComplete = useAppStore((s) => s.bootComplete)
  const activeSection = useAppStore((s) => s.activeSection)
  const focusY = SECTION_FOCUS_OFFSET[activeSection] ?? 0
  const [nebulaX, nebulaY] = (bootComplete && SECTION_NEBULA_OFFSET[activeSection]) ? SECTION_NEBULA_OFFSET[activeSection] : [0, 0]
  const [experienceDrift, setExperienceDrift] = useState(false)
  const [webglContextLost, setWebglContextLost] = useState(false)
  const prevSectionRef = useRef(activeSection)

  useEffect(() => {
    if (bootComplete && prevSectionRef.current !== 'experience' && activeSection === 'experience') {
      setExperienceDrift(true)
    }
    prevSectionRef.current = activeSection
  }, [activeSection, bootComplete])

  return (
    <div className="fixed inset-0 -z-10 bg-void overflow-hidden" aria-hidden>
      {/* Dim overlay during boot — smooth transition */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: 'rgba(0, 0, 0, 0.35)',
          opacity: bootInProgress ? 1 : 0,
        }}
        aria-hidden
      />
      {/* Faint nebula gradient - position shifts subtly per section (transform only) */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-[400ms] ease-out"
        style={{
          willChange: 'transform',
          transform: `translate(${nebulaX}%, ${nebulaY}%)`,
          background: `
            radial-gradient(ellipse 100% 80% at 70% 20%, rgba(26, 26, 46, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 80% 100% at 20% 80%, rgba(22, 33, 62, 0.35) 0%, transparent 45%),
            radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0, 212, 255, 0.03) 0%, transparent 70%)
          `,
        }}
      />
      {/* Section focus: lighting refocuses toward active section (Console only, transform only) */}
      {bootComplete && !bootInProgress && (
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${focusY}%)`,
            willChange: 'transform',
            background: `
              radial-gradient(ellipse 90% 50% at 50% 50%, rgba(0, 212, 255, 0.04) 0%, transparent 55%),
              radial-gradient(ellipse 70% 80% at 50% 45%, rgba(30, 41, 59, 0.12) 0%, transparent 50%)
            `,
          }}
          aria-hidden
        />
      )}
      {/* Depth fog - vignette: darker at edges and bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, transparent 40%, rgba(10, 10, 15, 0.4) 100%),
            linear-gradient(to bottom, transparent 50%, rgba(10, 10, 15, 0.6) 100%)
          `,
        }}
      />
      {/* Starfield + canvas: slight drift when entering Experience section (~5px, starts before content) */}
      {webglContextLost && (
        <div
          className="absolute inset-0 bg-void"
          aria-hidden
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(15,15,25,0.95) 0%, rgba(8,8,12,0.98) 100%)',
          }}
        />
      )}
      <motion.div
        className="absolute inset-0"
        style={{ willChange: 'transform', visibility: webglContextLost ? 'hidden' : 'visible' }}
        animate={{ y: experienceDrift ? [0, 5, 0] : 0 }}
        transition={{
          duration: 0.28,
          ease: 'easeOut',
        }}
        onAnimationComplete={() => experienceDrift && setExperienceDrift(false)}
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 20], fov: 60 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement
            canvas.addEventListener(
              'webglcontextlost',
              (e) => {
                e.preventDefault()
                setWebglContextLost(true)
              },
              false
            )
            canvas.addEventListener('webglcontextrestored', () => setWebglContextLost(false), false)
          }}
        >
          <Suspense fallback={null}>
            <DepthFog />
            <Starfield />
            <CameraDrift />
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  )
}
