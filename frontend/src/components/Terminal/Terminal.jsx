import { motion } from 'framer-motion'

export default function Terminal({ title = 'terminal', children, className = '', idle = false }) {
  return (
    <motion.div
      className={`
        relative rounded-lg border border-glass-border bg-panel-bg/90 backdrop-blur-md
        shadow-panel overflow-hidden font-space text-sm
        ${className}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: idle
          ? [
              '0 4px 24px rgba(0,0,0,0.2)',
              '0 4px 24px rgba(0,0,0,0.2), 0 0 24px rgba(0, 212, 255, 0.035)',
              '0 4px 24px rgba(0,0,0,0.2)',
            ]
          : '0 4px 24px rgba(0,0,0,0.2)',
      }}
      transition={{
        opacity: { duration: 0.3 },
        y: { duration: 0.3 },
        boxShadow: idle ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : {},
      }}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-glass-border bg-void/50">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="text-gray-500 ml-2 font-orbitron text-xs">{title}</span>
      </div>
      <div className="relative p-4 text-gray-200 min-h-[120px] text-[15px] leading-relaxed">
        {children}
        {/* Faint scan shimmer when idle — transform only, no layout */}
        {idle && (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-b-lg"
            aria-hidden
          >
            <motion.div
              className="absolute left-0 right-0 top-0 h-0.5"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%)',
                willChange: 'transform',
              }}
              animate={{ y: [0, 320] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
