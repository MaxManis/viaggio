import { useRouteContext } from '../hooks/useRoute'
import { pointsInOrder, useTripStore } from '../store/useTripStore'
import { formatDistance, formatDuration } from '../lib/routing'
import { googleMapsRouteUrl } from '../lib/navlinks'

export default function RouteBar() {
  const trip = useTripStore((s) => s.trip)
  const { route, status } = useRouteContext()
  const points = pointsInOrder(trip)

  if (points.length < 2) return null

  const tooMany = points.length > 11 // origin + destination + ~9 waypoints

  return (
    <div className="routebar">
      <div className="routebar__stat">
        <span className="routebar__icon">🚗</span>{' '}
        {route ? (
          <span>
            <strong>{formatDuration(route.duration)}</strong> · {formatDistance(route.distance)}
          </span>
        ) : status === 'loading' ? (
          <span className="muted">calculating route…</span>
        ) : status === 'error' ? (
          <span className="muted">route unavailable</span>
        ) : (
          <span className="muted">—</span>
        )}
      </div>
      <a
        className="routebar__btn"
        href={googleMapsRouteUrl(points)}
        target="_blank"
        rel="noopener noreferrer"
        title={
          tooMany
            ? 'Google Maps may drop stops beyond ~10'
            : 'Open the whole route in Google Maps'
        }
      >
        Open route ↗
      </a>
    </div>
  )
}
