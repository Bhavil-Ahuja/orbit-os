/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        space: ['Space Mono', 'monospace'],
        exo: ['Exo 2', 'sans-serif'],
      },
      colors: {
        void: '#0a0a0f',
        nebula: '#1a1a2e',
        cosmic: '#16213e',
        accent: '#00d4ff',
        'accent-dim': '#00a8cc',
        glow: 'rgba(0, 212, 255, 0.4)',
        'panel-bg': 'rgba(10, 10, 15, 0.85)',
        'glass': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 212, 255, 0.25)',
        'glow-xl': '0 0 60px rgba(0, 212, 255, 0.2)',
        'panel': '0 0 0 1px rgba(0, 212, 255, 0.2), 0 0 30px rgba(0, 0, 0, 0.5)',
        'card-float': '0 0 0 1px rgba(0, 212, 255, 0.25), 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.15)',
        'card-hover': '0 0 0 1px rgba(0, 212, 255, 0.4), 0 35px 60px -15px rgba(0, 0, 0, 0.6), 0 0 60px rgba(0, 212, 255, 0.25)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 2.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(0, 212, 255, 0.5)' },
        },
        'scan': {
          '0%': { opacity: '0', transform: 'scale(0.98)', filter: 'brightness(0.6)' },
          '60%': { opacity: '1', filter: 'brightness(1.2)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'brightness(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) translateZ(0)' },
          '50%': { transform: 'translateY(-8px) translateZ(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
