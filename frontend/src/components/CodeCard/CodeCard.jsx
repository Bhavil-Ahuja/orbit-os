import { motion } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'react-syntax-highlighter/dist/esm/styles/prism.css'

export default function CodeCard({ code, language = 'javascript', title }) {
  return (
    <motion.div
      className="rounded-lg border border-glass-border bg-panel-bg/90 backdrop-blur-md overflow-hidden font-space shadow-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <div className="px-4 py-2 border-b border-glass-border text-accent font-orbitron text-xs">
          {title}
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.8rem',
          background: 'rgba(10, 10, 15, 0.6)',
        }}
        showLineNumbers
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </motion.div>
  )
}
