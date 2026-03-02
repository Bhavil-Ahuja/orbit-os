import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import ContactCard from '../components/ContactCard/ContactCard'

function SignalRings() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,212,255,0.12)]"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={
            inView
              ? {
                  scale: [0.6, 1.15, 1.15],
                  opacity: [0, 0.06, 0],
                }
              : {}
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1.3,
            times: [0, 0.5, 1],
          }}
        />
      ))}
    </div>
  )
}

export default function StayInTouch() {
  return (
    <motion.div
      className="relative max-w-2xl mx-auto px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-2">
        Deep Space Transmission Console
      </h1>
      <p className="text-gray-400 font-exo text-base mb-8">
        Open channel for transmission. All signals encrypted.
      </p>
      <div className="relative">
        <SignalRings />
        <ContactCard />
      </div>
    </motion.div>
  )
}
