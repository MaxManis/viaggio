import { useTripStore } from '../store/useTripStore'
import BudgetSummary from './BudgetSummary'
import PointDetail from './PointDetail'
import PointList from './PointList'
import RouteBar from './RouteBar'

export default function Sidebar() {
  const selectedPointId = useTripStore((s) => s.selectedPointId)
  const tripName = useTripStore((s) => s.trip.name)
  const setTripName = useTripStore((s) => s.setTripName)

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <input
          className="trip-name"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          aria-label="Trip name"
          placeholder="Trip name"
        />
        <BudgetSummary />
        <RouteBar />
      </header>
      <div className="sidebar__body">
        {selectedPointId ? <PointDetail key={selectedPointId} /> : <PointList />}
      </div>
    </aside>
  )
}
