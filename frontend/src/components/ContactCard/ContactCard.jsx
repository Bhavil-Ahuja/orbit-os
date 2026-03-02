import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check } from 'lucide-react'

const PROGRESS_LINES = [
  '> Establishing uplink...',
  '> Encrypting transmission...',
  '> Routing signal through relay...',
  '> Transmission successful.',
]

const LINE_DELAY_MS = 450

export default function ContactCard() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [sent, setSent] = useState(false)
  const [buttonHover, setButtonHover] = useState(false)
  const [showSuccessGlow, setShowSuccessGlow] = useState(false)

  useEffect(() => {
    if (!sending) return
    const steps = PROGRESS_LINES.length
    const ids = []
    for (let i = 0; i < steps; i++) {
      ids.push(setTimeout(() => setProgressStep(i + 1), (i + 1) * LINE_DELAY_MS))
    }
    ids.push(
      setTimeout(() => {
        setSending(false)
        setSent(true)
        setShowSuccessGlow(true)
        setForm({ name: '', email: '', message: '' })
      }, steps * LINE_DELAY_MS + 400)
    )
    return () => ids.forEach(clearTimeout)
  }, [sending])

  const handleSubmit = (e) => {
    e.preventDefault()
    setProgressStep(0)
    setSending(true)
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const buttonLabel = sending
    ? 'Transmitting...'
    : buttonHover
      ? 'Ready for Launch'
      : 'Transmit Signal'

  return (
    <motion.div
      className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 max-w-md mx-auto overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: showSuccessGlow
          ? [
              '0 0 0 1px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.15), inset 0 0 60px rgba(0,212,255,0.03)',
              '0 0 0 1px rgba(0,212,255,0.4), 0 0 50px rgba(0,212,255,0.2), inset 0 0 80px rgba(0,212,255,0.05)',
              '0 0 0 1px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.15), inset 0 0 60px rgba(0,212,255,0.03)',
            ]
          : '0 0 0 1px rgba(0,212,255,0.15), 0 0 24px rgba(0,212,255,0.06)',
      }}
      transition={{
        duration: 0.4,
        boxShadow: showSuccessGlow ? { duration: 2, repeat: Infinity, repeatType: 'reverse' } : { duration: 0.3 },
      }}
    >
      <h3 className="font-orbitron text-accent/90 text-lg mb-4">Transmission Console</h3>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 text-accent font-orbitron text-sm">
              <Check size={18} strokeWidth={2.5} />
              Signal Received ✓
            </div>
            <p className="text-gray-200 font-exo text-base leading-relaxed">
              Signal received. I'll respond once transmission reaches orbit.
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {sending ? (
              <div className="font-space text-sm space-y-2 py-2">
                {PROGRESS_LINES.map((line, i) => (
                  <motion.div
                    key={line}
                    className="text-accent/90"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: progressStep > i ? 1 : 0.3, x: progressStep > i ? 0 : -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs text-gray-500 font-orbitron mb-1">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-gray-500 font-exo text-base focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs text-gray-500 font-orbitron mb-1">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-gray-500 font-exo text-base focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs text-gray-500 font-orbitron mb-1">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-gray-500 font-exo text-base leading-relaxed focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent/15 border border-accent/40 text-accent font-orbitron text-sm hover:bg-accent/25 disabled:opacity-70 transition-colors"
                  whileHover={!sending ? { scale: 1.02 } : {}}
                  whileTap={!sending ? { scale: 0.98 } : {}}
                  onMouseEnter={() => setButtonHover(true)}
                  onMouseLeave={() => setButtonHover(false)}
                >
                  {sending ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full"
                      />
                      Transmitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {buttonLabel}
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
