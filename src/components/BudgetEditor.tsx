import { useTripStore } from '../store/useTripStore'
import { formatMoney } from '../lib/format'
import type { BudgetCategory, BudgetItem } from '../types'

const CATEGORIES: BudgetCategory[] = [
  'hotel',
  'fuel',
  'toll',
  'parking',
  'food',
  'activity',
  'other',
]

type Props = {
  scope: string // point id or GLOBAL_SCOPE
  items: BudgetItem[]
}

export default function BudgetEditor({ scope, items }: Props) {
  const addBudgetItem = useTripStore((s) => s.addBudgetItem)
  const updateBudgetItem = useTripStore((s) => s.updateBudgetItem)
  const removeBudgetItem = useTripStore((s) => s.removeBudgetItem)

  const subtotal = items.reduce((sum, it) => sum + (it.amount || 0), 0)

  return (
    <div className="budget-editor">
      {items.length > 0 && (
        <div className="budget-row budget-row--head">
          <span>Item</span>
          <span>Category</span>
          <span className="budget-row__amount">Amount</span>
          <span title="Paid?">✓</span>
          <span />
        </div>
      )}

      {items.map((it) => (
        <div className="budget-row" key={it.id}>
          <input
            className="budget-row__label"
            placeholder="What for?"
            value={it.label}
            onChange={(e) => updateBudgetItem(scope, it.id, { label: e.target.value })}
          />
          <select
            className="budget-row__cat"
            value={it.category}
            onChange={(e) =>
              updateBudgetItem(scope, it.id, { category: e.target.value as BudgetCategory })
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            className="budget-row__amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            value={it.amount || ''}
            onChange={(e) =>
              updateBudgetItem(scope, it.id, { amount: parseFloat(e.target.value) || 0 })
            }
          />
          <label className="budget-row__paid" title="Mark as paid">
            <input
              type="checkbox"
              checked={it.paid}
              onChange={(e) => updateBudgetItem(scope, it.id, { paid: e.target.checked })}
            />
          </label>
          <button
            className="budget-row__del danger"
            title="Remove"
            onClick={() => removeBudgetItem(scope, it.id)}
          >
            ✕
          </button>
        </div>
      ))}

      <div className="budget-editor__footer">
        <button className="btn-add" onClick={() => addBudgetItem(scope)}>
          + Add cost
        </button>
        <span className="budget-editor__subtotal">{formatMoney(subtotal)}</span>
      </div>
    </div>
  )
}
