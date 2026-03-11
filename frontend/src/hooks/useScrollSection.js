import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'

const SECTION_IDS = ['about', 'systems', 'experience', 'projects', 'publications', 'skills', 'resume', 'stay-in-touch']
const SECTION_TRANSITION_MS = 300

/**
 * Observes section elements and sets the active section in the store when one is in view.
 * Triggers sectionTransitioning for ~300ms so environment (starfield, focus) can react.
 * @param {React.RefObject} scrollContainerRef - The scrollable parent
 * @param {Record<string, React.RefObject>} sectionRefs - Map of section id to ref
 */
export function useScrollSection(scrollContainerRef, sectionRefs) {
  const setActiveSection = useAppStore((s) => s.setActiveSection)
  const setSectionTransitioning = useAppStore((s) => s.setSectionTransitioning)
  const transitionTimerRef = useRef(null)

  useEffect(() => {
    const container = scrollContainerRef?.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = entry.target.id
          if (SECTION_IDS.includes(id)) {
            setSectionTransitioning(true)
            if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
            transitionTimerRef.current = setTimeout(() => {
              setSectionTransitioning(false)
              transitionTimerRef.current = null
            }, SECTION_TRANSITION_MS)
            setActiveSection(id)
            break
          }
        }
      },
      {
        root: container,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      }
    )

    SECTION_IDS.forEach((id) => {
      const el = sectionRefs[id]?.current
      if (el) observer.observe(el)
    })

    return () => {
      observer.disconnect()
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    }
  }, [scrollContainerRef, sectionRefs, setActiveSection, setSectionTransitioning])
}

export function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
