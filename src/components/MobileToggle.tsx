import { useUI } from '../ui/ui'

export default function MobileToggle() {
  const { view, setView } = useUI()
  return (
    <div className="mobile-toggle" role="tablist" aria-label="Switch view">
      <button
        role="tab"
        aria-selected={view === 'map'}
        className={view === 'map' ? 'is-active' : ''}
        onClick={() => setView('map')}
      >
        🗺️ Map
      </button>
      <button
        role="tab"
        aria-selected={view === 'list'}
        className={view === 'list' ? 'is-active' : ''}
        onClick={() => setView('list')}
      >
        📋 Stops
      </button>
    </div>
  )
}
