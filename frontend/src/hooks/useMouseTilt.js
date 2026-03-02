import { useState, useCallback, useRef } from 'react'

/**
 * Returns transform style for parallax tilt + mouse position for follow effects (e.g. glow).
 * @param {Object} options
 * @param {number} options.maxTilt - Max rotation in degrees (default 8)
 * @param {number} options.perspective - CSS perspective in px (default 800)
 */
export function useMouseTilt({ maxTilt = 8, perspective = 800 } = {}) {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 })
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const ref = useRef(null)

  const handleMouseMove = useCallback(
    (e) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const xNorm = (e.clientX - rect.left) / rect.width
      const yNorm = (e.clientY - rect.top) / rect.height
      const x = xNorm - 0.5
      const y = yNorm - 0.5
      setTransform({
        rotateX: -y * maxTilt,
        rotateY: x * maxTilt,
      })
      setMousePos({ x: xNorm, y: yNorm })
    },
    [maxTilt]
  )

  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0 })
    setMousePos({ x: 0.5, y: 0.5 })
  }, [])

  const style = {
    transform: `perspective(${perspective}px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
    transformStyle: 'preserve-3d',
  }

  return { ref, style, mousePos, handleMouseMove, handleMouseLeave }
}
