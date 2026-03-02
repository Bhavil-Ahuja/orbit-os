import { useAppStore } from '../store/useAppStore'
import Home from './Home'
import Console from './Console'

/**
 * Root route: / shows Landing until "Explore the Universe", then Console (main app).
 * URL stays http://localhost:3000/
 */
export default function MainRoute() {
  const bootComplete = useAppStore((s) => s.bootComplete)
  return bootComplete ? <Console /> : <Home />
}
