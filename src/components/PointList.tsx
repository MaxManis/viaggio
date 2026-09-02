import { GLOBAL_SCOPE, pointsInOrder, useTripStore } from '../store/useTripStore'
import { useRouteContext } from '../hooks/useRoute'
import { formatDistance, formatDuration } from '../lib/routing'
import BudgetEditor from './BudgetEditor'

export default function PointList() {
  const trip = useTripStore((s) => s.trip)
  const selectPoint = useTripStore((s) => s.selectPoint)
  const movePoint = useTripStore((s) => s.movePoint)
  const { route } = useRouteContext()

  const points = pointsInOrder(trip)

  return (
    <>
      {points.length === 0 ? (
        <div className="empty">
          <p className="empty__title">No stops yet</p>
          <p className="empty__hint">Open the map and tap to drop your first stop.</p>
        </div>
      ) : (
        <ul className="point-list">
          {points.map((p, i) => (
            <li key={p.id}>
              <div className="point-list__item">
                <button className="point-list__main" onClick={() => selectPoint(p.id)}>
                  <span className="point-list__num">{i + 1}</span>
                  <span className="point-list__text">
                    <span className="point-list__name">{p.name}</span>
                    <span className="point-list__meta">
                      {p.nights ? `${p.nights} night${p.nights > 1 ? 's' : ''}` : 'day stop'}
                      {p.hotel?.name ? ` · ${p.hotel.name}` : ''}
                      {p.inZTL ? ' · ⚠ ZTL' : ''}
                    </span>
                  </span>
                  <span className="point-list__chevron">›</span>
                </button>
                <div className="point-list__actions">
                  <button title="Move up" onClick={() => movePoint(p.id, -1)} disabled={i === 0}>
                    ↑
                  </button>
                  <button
                    title="Move down"
                    onClick={() => movePoint(p.id, 1)}
                    disabled={i === points.length - 1}
                  >
                    ↓
                  </button>
                </div>
              </div>

              {i < points.length - 1 && (
                <div className="leg">
                  <span className="leg__tick" />
                  <span className="leg__text">
                    {route?.legs[i]
                      ? `${formatDuration(route.legs[i].duration)} · ${formatDistance(
                          route.legs[i].distance,
                        )}`
                      : 'drive to next'}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <section className="detail__section trip-wide">
        <h3 className="detail__h">Trip-wide costs</h3>
        <p className="hint">Fuel estimate, autostrada tolls, car rental, insurance…</p>
        <BudgetEditor scope={GLOBAL_SCOPE} items={trip.globalBudget} />
      </section>
    </>
  )
}
