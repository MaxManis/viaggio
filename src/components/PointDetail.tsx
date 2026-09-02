import { pointSubtotal, useTripStore } from '../store/useTripStore'
import { formatMoney } from '../lib/format'
import { useUI } from '../ui/ui'
import BudgetEditor from './BudgetEditor'
import NavLinks from './NavLinks'
import type { Hotel } from '../types'

export default function PointDetail() {
  const point = useTripStore((s) => s.trip.points.find((p) => p.id === s.selectedPointId))
  const updatePoint = useTripStore((s) => s.updatePoint)
  const removePoint = useTripStore((s) => s.removePoint)
  const selectPoint = useTripStore((s) => s.selectPoint)
  const { isMobile, setView } = useUI()

  if (!point) return null

  const setHotel = (patch: Partial<Hotel>) =>
    updatePoint(point.id, { hotel: { ...point.hotel, ...patch } })

  return (
    <div className="detail">
      <div className="detail__topbar">
        <button className="btn-back" onClick={() => selectPoint(null)}>
          ← All stops
        </button>
        {isMobile && (
          <button className="btn-secondary" onClick={() => setView('map')}>
            📍 Show on map
          </button>
        )}
      </div>

      <input
        className="detail__name"
        value={point.name}
        onChange={(e) => updatePoint(point.id, { name: e.target.value })}
        placeholder="Stop name"
      />
      <div className="detail__coords">
        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
      </div>

      <section className="detail__section">
        <div className="field-row">
          <label className="field">
            <span>Arrival</span>
            <input
              type="date"
              value={point.arrivalDate ?? ''}
              onChange={(e) => updatePoint(point.id, { arrivalDate: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Nights</span>
            <input
              type="number"
              min="0"
              value={point.nights ?? ''}
              onChange={(e) => updatePoint(point.id, { nights: parseInt(e.target.value, 10) || 0 })}
            />
          </label>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={!!point.inZTL}
            onChange={(e) => updatePoint(point.id, { inZTL: e.target.checked })}
          />
          <span>Inside a ZTL (limited-traffic zone) — check before driving in</span>
        </label>
      </section>

      <section className="detail__section">
        <h3 className="detail__h">Navigate here</h3>
        <NavLinks point={point} />
      </section>

      <section className="detail__section">
        <h3 className="detail__h">Hotel</h3>
        <input
          className="w-full"
          placeholder="Hotel name"
          value={point.hotel?.name ?? ''}
          onChange={(e) => setHotel({ name: e.target.value })}
        />
        <input
          className="w-full"
          placeholder="Address"
          value={point.hotel?.address ?? ''}
          onChange={(e) => setHotel({ address: e.target.value })}
        />
        <div className="field-row">
          <label className="field">
            <span>Check-in</span>
            <input
              type="date"
              value={point.hotel?.checkIn ?? ''}
              onChange={(e) => setHotel({ checkIn: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Check-out</span>
            <input
              type="date"
              value={point.hotel?.checkOut ?? ''}
              onChange={(e) => setHotel({ checkOut: e.target.value })}
            />
          </label>
        </div>
        <input
          className="w-full"
          placeholder="Booking reference"
          value={point.hotel?.bookingRef ?? ''}
          onChange={(e) => setHotel({ bookingRef: e.target.value })}
        />
        <input
          className="w-full"
          placeholder="Booking link (URL)"
          value={point.hotel?.url ?? ''}
          onChange={(e) => setHotel({ url: e.target.value })}
        />
      </section>

      <section className="detail__section">
        <h3 className="detail__h">Notes</h3>
        <textarea
          className="w-full"
          rows={4}
          placeholder="Anything to remember about this stop…"
          value={point.notes ?? ''}
          onChange={(e) => updatePoint(point.id, { notes: e.target.value })}
        />
      </section>

      <section className="detail__section">
        <div className="detail__section-head">
          <h3 className="detail__h">Budget for this stop</h3>
          <span className="detail__subtotal">{formatMoney(pointSubtotal(point))}</span>
        </div>
        <BudgetEditor scope={point.id} items={point.budget} />
      </section>

      <button className="btn-danger" onClick={() => removePoint(point.id)}>
        Delete this stop
      </button>
    </div>
  )
}
