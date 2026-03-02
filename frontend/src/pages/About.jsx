import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Terminal from '../components/Terminal/Terminal'
import { contentService } from '../services/contentService'

export default function About() {
  const [data, setData] = useState(null)
  const [displayText, setDisplayText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    contentService.getAbout().then(setData)
  }, [])

  useEffect(() => {
    if (!data?.content) return
    const full = data.content
    let i = 0
    const id = setInterval(() => {
      if (i >= full.length) {
        clearInterval(id)
        setDone(true)
        return
      }
      setDisplayText(full.slice(0, i + 1))
      i += 1
    }, 20)
    return () => clearInterval(id)
  }, [data?.content])

  return (
    <motion.div
      className="max-w-3xl mx-auto px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-2">
        About
      </h1>
      <Terminal title="about_bhavil.txt" idle={done}>
        <pre className="font-space text-sm text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
          {displayText}
          {displayText.length > 0 && (
            <motion.span
              className="inline-block min-w-[0.5em]"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, ease: 'steps(1)' }}
              aria-hidden
            >
              |
            </motion.span>
          )}
        </pre>
      </Terminal>
    </motion.div>
  )
}
