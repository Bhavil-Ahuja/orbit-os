import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { useAppStore } from './store/useAppStore'
import { useAdminAuthCheck } from './hooks/useAdminAuthCheck'
import SpaceBackground from './components/SpaceBackground/SpaceBackground'
import Navbar from './components/Navbar/Navbar'
import SocialDock from './components/SocialDock/SocialDock'
import BootstrapLoader from './components/BootstrapLoader/BootstrapLoader'
import { warpVariants } from './animations/pageTransition'

const MainRoute = lazy(() => import('./pages/MainRoute'))
const ExploreRoute = lazy(() => import('./pages/ExploreRoute'))
const WhoAmI = lazy(() => import('./pages/WhoAmI'))

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const bootComplete = useAppStore((state) => state.bootComplete)
  const isAdmin = location.pathname === '/whoami'
  const showNav = bootComplete && !isAdmin && location.pathname === '/explore'

  useAdminAuthCheck()

  return (
    <BootstrapLoader>
      <SpaceBackground />
      {showNav && (
        <>
          <Navbar />
          <SocialDock />
        </>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={warpVariants}
          initial="exit"
          animate="enter"
          exit="exit"
          className="min-h-screen"
        >
          <Suspense fallback={<PageFallback />}>
            <Routes location={location}>
              <Route path="/" element={<MainRoute />} />
              <Route path="/explore" element={<ExploreRoute />} />
              <Route path="/app" element={<Navigate to="/explore" replace />} />
              <Route path="/console" element={<Navigate to="/explore" replace />} />
              <Route path="/whoami" element={<WhoAmI />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </BootstrapLoader>
  )
}

export default function App() {
  return (
    <div className="min-h-screen text-white gpu-layer">
      <AppContent />
    </div>
  )
}
