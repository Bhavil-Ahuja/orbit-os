import { motion } from 'framer-motion'

// Tiled noise for diffuse boundary (2% opacity) — breaks traceable circular edge
const NOISE_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' result='noise'/%3E%3CfeColorMatrix in='noise' type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23fff' filter='url(%23n)'/%3E%3C/svg%3E"

// Layers extend past viewport (150vmax) so no div edges visible; gradients stay 65vmax visual size
const LAYER_SIZE = '150vmax'
const LAYER_HALF = '75vmax'
const CENTER = '50% 65%'

/**
 * EclipseCore — Distant celestial body affecting surrounding space.
 * triggerPulse: when true, runs a one-time soft glow pulse (e.g. on Access Granted).
 */
export default function EclipseCore({ className = '', triggerPulse = false }) {
  return (
    <motion.div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
      style={{ willChange: 'transform' }}
      initial={{ x: 0, y: 0, scale: 1 }}
      animate={{
        x: [0, 8, 0],
        y: [0, -6, 0],
        scale: [1, 1.02, 1],
      }}
      transition={{
        x: { duration: 50, repeat: Infinity, ease: 'linear' },
        y: { duration: 50, repeat: Infinity, ease: 'linear' },
        scale: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      {/* 1. Star dimming: multiply with starfield; gradient sized so no layer edge in view */}
      <div
        className="absolute"
        style={{
          width: LAYER_SIZE,
          height: LAYER_SIZE,
          left: '50%',
          top: '50%',
          marginLeft: `-${LAYER_HALF}`,
          marginTop: `-${LAYER_HALF}`,
          background: `
            radial-gradient(
              circle at ${CENTER},
              rgba(0, 0, 0, 0.5) 0%,
              rgba(0, 0, 0, 0.25) 45%,
              rgba(0, 0, 0, 0.04) 72%,
              rgba(0, 0, 0, 0.01) 82%,
              transparent 90%
            )
          `,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* 2. Main gradient: soft transition; gradient sized, layer full-bleed */}
      <div
        className="absolute"
        style={{
          width: LAYER_SIZE,
          height: LAYER_SIZE,
          left: '50%',
          top: '50%',
          marginLeft: `-${LAYER_HALF}`,
          marginTop: `-${LAYER_HALF}`,
          background: `
            radial-gradient(
              circle at ${CENTER},
              #020617 0%,
              #0a0f1e 18%,
              #0f172a 38%,
              rgba(30, 41, 59, 0.5) 52%,
              rgba(30, 41, 59, 0.22) 65%,
              rgba(15, 23, 42, 0.06) 75%,
              rgba(15, 23, 42, 0.02) 84%,
              transparent 92%
            )
          `,
          boxShadow: `
            inset 0 0 120px rgba(0, 0, 0, 0.4),
            inset 0 0 50px rgba(2, 6, 23, 0.6)
          `,
        }}
      />

      {/* 3. Asymmetrical lighting */}
      <div
        className="absolute"
        style={{
          width: LAYER_SIZE,
          height: LAYER_SIZE,
          left: '50%',
          top: '50%',
          marginLeft: `-${LAYER_HALF}`,
          marginTop: `-${LAYER_HALF}`,
          background: `
            radial-gradient(
              circle at 25% 35%,
              rgba(255, 255, 255, 0.018) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 78% 88%,
              rgba(0, 0, 0, 0.06) 0%,
              transparent 55%
            )
          `,
          pointerEvents: 'none',
        }}
      />

      {/* 4. Soft atmospheric glow — layer full-bleed so no visible edges */}
      <div
        className="absolute"
        style={{
          width: LAYER_SIZE,
          height: LAYER_SIZE,
          left: '50%',
          top: '50%',
          marginLeft: `-${LAYER_HALF}`,
          marginTop: `-${LAYER_HALF}`,
          boxShadow: `
            0 0 120px 40px rgba(0, 212, 255, 0.018),
            0 0 200px 60px rgba(0, 212, 255, 0.01),
            0 0 280px 80px rgba(59, 130, 246, 0.006)
          `,
          pointerEvents: 'none',
        }}
      />
      {/* One-time subtle glow pulse (~200ms) when Access Granted */}
      {triggerPulse && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.45, 0] }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            background: 'radial-gradient(circle at 50% 65%, rgba(0, 212, 255, 0.2) 0%, transparent 55%)',
          }}
          aria-hidden
        />
      )}

      {/* 5. Vignette: circular depth */}
      <div
        className="absolute"
        style={{
          width: LAYER_SIZE,
          height: LAYER_SIZE,
          left: '50%',
          top: '50%',
          marginLeft: `-${LAYER_HALF}`,
          marginTop: `-${LAYER_HALF}`,
          background: `
            radial-gradient(
              circle at ${CENTER},
              transparent 40%,
              rgba(0, 0, 0, 0.08) 68%,
              rgba(0, 0, 0, 0.02) 82%,
              transparent 92%
            )
          `,
          pointerEvents: 'none',
        }}
      />

      {/* 6. Noise/grain overlay — 2% opacity, breaks uniform circular boundary */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("${NOISE_DATA_URI}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '140px 140px',
          pointerEvents: 'none',
        }}
        aria-hidden
      />
    </motion.div>
  )
}
