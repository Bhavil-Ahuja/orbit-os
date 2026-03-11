import { useRef, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useScrollSection } from '../hooks/useScrollSection'
import { useAppStore } from '../store/useAppStore'
import About from './About'
import Systems from './Systems'
import Experience from './Experience'
import Projects from './Projects'
import Publications from './Publications'
import Skills from './Skills'
import Resume from './Resume'
import StayInTouch from './StayInTouch'

const SECTIONS = [
  { id: 'about', Component: About },
  { id: 'systems', Component: Systems },
  { id: 'experience', Component: Experience },
  { id: 'projects', Component: Projects },
  { id: 'publications', Component: Publications },
  { id: 'skills', Component: Skills },
  { id: 'resume', Component: Resume },
  { id: 'stay-in-touch', Component: StayInTouch },
]

export default function Console() {
  const scrollRef = useRef(null)
  const aboutRef = useRef(null)
  const systemsRef = useRef(null)
  const experienceRef = useRef(null)
  const projectsRef = useRef(null)
  const publicationsRef = useRef(null)
  const skillsRef = useRef(null)
  const resumeRef = useRef(null)
  const stayInTouchRef = useRef(null)

  const sectionRefs = useMemo(
    () => ({
      'about': aboutRef,
      'systems': systemsRef,
      'experience': experienceRef,
      'projects': projectsRef,
      'publications': publicationsRef,
      'skills': skillsRef,
      'resume': resumeRef,
      'stay-in-touch': stayInTouchRef,
    }),
    []
  )

  useScrollSection(scrollRef, sectionRefs)
  const activeSection = useAppStore((state) => state.activeSection)

  // When viewer lands on /console directly (e.g. shared link), treat as "in system"
  useEffect(() => {
    useAppStore.getState().setBootComplete(true)
  }, [])

  return (
    <div
      ref={scrollRef}
      id="console-scroll"
      className="h-screen overflow-y-auto overflow-x-hidden snap-y snap-proximity scroll-smooth pr-4 pt-[max(3.5rem,calc(env(safe-area-inset-top)+2.5rem))] md:pr-24 md:pt-24"
      style={{ scrollbarGutter: 'stable' }}
    >
      {SECTIONS.map(({ id, Component }) => {
        const sectionRef = sectionRefs[id]
        const isActive = activeSection === id
        return (
          <section
            key={id}
            id={id}
            ref={sectionRef}
            className="min-h-screen snap-start flex items-start justify-center pt-6 pb-20 px-4 overflow-hidden md:pt-24 md:pb-12"
          >
            <motion.div
              className="w-full max-w-4xl mx-auto"
              animate={{ scale: isActive ? 1.01 : 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ transformOrigin: 'center center' }}
            >
              <Component />
            </motion.div>
          </section>
        )
      })}
    </div>
  )
}
