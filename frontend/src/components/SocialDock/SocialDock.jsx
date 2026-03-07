import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Linkedin, Twitter } from 'lucide-react'

const links = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/bhavil-ahuja' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/Bhavil-Ahuja' },
  { icon: Twitter, label: 'X', href: 'https://x.com/AhujaBhavil' },
]

function SocialLink({ icon: Icon, label, href, delay }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="relative flex items-center justify-center"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* Signal pulse outward — transform + opacity only */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
              willChange: 'transform',
            }}
            initial={{ scale: 0.85, opacity: 0.35 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Transmission line — brief extension on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            className="absolute -bottom-0.5 left-1/2 h-px w-6 -translate-x-1/2 pointer-events-none origin-center"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent)',
              willChange: 'transform',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="relative p-2.5 rounded-xl text-gray-400 border border-transparent transition-colors duration-200 hover:text-accent hover:border-accent/25"
        whileHover={{
          scale: 1.08,
          transition: { duration: 0.2 },
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.2), 0 0 40px rgba(0, 212, 255, 0.08)',
        }}
        whileTap={{ scale: 0.96 }}
      >
        <Icon size={22} strokeWidth={1.5} />
      </motion.a>
    </motion.div>
  )
}

export default function SocialDock() {
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 z-40 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-glass-border bg-panel-bg/90 backdrop-blur-md shadow-panel md:bottom-6 md:gap-3 md:px-4 md:py-3 md:rounded-2xl"
      initial={{ x: '-50%', y: 20, opacity: 0 }}
      animate={{ x: '-50%', y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      role="group"
      aria-label="Social links"
    >
      {links.map(({ icon, label, href }, i) => (
        <SocialLink
          key={label}
          icon={icon}
          label={label}
          href={href}
          delay={0.6 + i * 0.05}
        />
      ))}
    </motion.div>
  )
}
