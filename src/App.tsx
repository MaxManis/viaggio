import AuthGate from './components/AuthGate'
import MapView from './components/MapView'
import MobileToggle from './components/MobileToggle'
import Sidebar from './components/Sidebar'
import { RouteProvider } from './hooks/useRoute'
import { useTripSync } from './hooks/useTripSync'
import { supabaseEnabled } from './lib/supabase'
import { UIProvider, useUI } from './ui/ui'

function Planner() {
  useTripSync(supabaseEnabled)
  const { view } = useUI()

  return (
    <div className="app" data-view={view}>
      <aside className="pane pane--list">
        <Sidebar />
      </aside>
      <main className="pane pane--map">
        <MapView />
      </main>
      <MobileToggle />
    </div>
  )
}

export default function App() {
  return (
    <AuthGate>
      <UIProvider>
        <RouteProvider>
          <Planner />
        </RouteProvider>
      </UIProvider>
    </AuthGate>
  )
}
