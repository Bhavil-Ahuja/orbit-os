// Suppress Three.js WebGL context lost/restored logs; we handle them in UI (SpaceBackground, Skills).
const origLog = console.log
console.log = (...args) => {
  const msg = args[0]
  if (typeof msg === 'string' && msg.startsWith('THREE.WebGLRenderer: Context ')) return
  origLog.apply(console, args)
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
