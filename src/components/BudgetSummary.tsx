import { budgetRemaining, budgetTotal, useTripStore } from '../store/useTripStore'
import { formatMoney } from '../lib/format'

export default function BudgetSummary() {
  const trip = useTripStore((s) => s.trip)
  const total = budgetTotal(trip)
  const remaining = budgetRemaining(trip)

  return (
    <div className="budget-summary">
      <div className="budget-summary__item">
        <span className="budget-summary__label">Total</span>
        <span className="budget-summary__value">{formatMoney(total, trip.currency)}</span>
      </div>
      <div className="budget-summary__item">
        <span className="budget-summary__label">Left to pay</span>
        <span className="budget-summary__value budget-summary__value--muted">
          {formatMoney(remaining, trip.currency)}
        </span>
      </div>
    </div>
  )
}
