import { motion } from 'framer-motion'
import ResumeViewer from '../components/ResumeViewer/ResumeViewer'

export default function Resume() {
  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8 pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="font-orbitron text-2xl md:text-3xl text-accent mb-4">
        Resume
      </h1>
      <p className="text-gray-400 font-exo text-sm mb-6">View or download</p>
      <ResumeViewer />
    </motion.div>
  )
}
