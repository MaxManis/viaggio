import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BudgetItem, Trip, TripPoint } from '../types'

const uid = () => crypto.randomUUID()

function emptyTrip(): Trip {
  return {
    id: uid(),
    name: 'Italy Road Trip',
    currency: 'EUR',
    points: [],
    globalBudget: [],
  }
}

/** Scope for budget operations: a point id, or the trip-wide bucket. */
export const GLOBAL_SCOPE = 'global'

type TripState = {
  trip: Trip
  selectedPointId: string | null

  setTripName: (name: string) => void

  addPoint: (lat: number, lng: number, name?: string) => void
  updatePoint: (id: string, patch: Partial<TripPoint>) => void
  removePoint: (id: string) => void
  movePoint: (id: string, dir: -1 | 1) => void
  selectPoint: (id: string | null) => void

  addBudgetItem: (scope: string, item?: Partial<BudgetItem>) => void
  updateBudgetItem: (scope: string, itemId: string, patch: Partial<BudgetItem>) => void
  removeBudgetItem: (scope: string, itemId: string) => void

  resetTrip: () => void
  /** Replace the whole trip (used by the sync layer when remote data arrives). */
  replaceTrip: (trip: Trip) => void
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trip: emptyTrip(),
      selectedPointId: null,

      setTripName: (name) => set((s) => ({ trip: { ...s.trip, name } })),

      addPoint: (lat, lng, name) =>
        set((s) => {
          const order = s.trip.points.length
          const point: TripPoint = {
            id: uid(),
            name: name?.trim() || `Stop ${order + 1}`,
            lat,
            lng,
            order,
            budget: [],
          }
          return {
            trip: { ...s.trip, points: [...s.trip.points, point] },
            selectedPointId: point.id,
          }
        }),

      updatePoint: (id, patch) =>
        set((s) => ({
          trip: {
            ...s.trip,
            points: s.trip.points.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
        })),

      removePoint: (id) =>
        set((s) => {
          const points = s.trip.points
            .filter((p) => p.id !== id)
            .map((p, i) => ({ ...p, order: i }))
          return {
            trip: { ...s.trip, points },
            selectedPointId: s.selectedPointId === id ? null : s.selectedPointId,
          }
        }),

      movePoint: (id, dir) =>
        set((s) => {
          const points = [...s.trip.points].sort((a, b) => a.order - b.order)
          const idx = points.findIndex((p) => p.id === id)
          const swap = idx + dir
          if (idx < 0 || swap < 0 || swap >= points.length) return s
          const tmp = points[idx]
          points[idx] = points[swap]
          points[swap] = tmp
          return {
            trip: { ...s.trip, points: points.map((p, i) => ({ ...p, order: i })) },
          }
        }),

      selectPoint: (id) => set({ selectedPointId: id }),

      addBudgetItem: (scope, item) =>
        set((s) => {
          const newItem: BudgetItem = {
            id: uid(),
            label: item?.label ?? '',
            amount: item?.amount ?? 0,
            category: item?.category ?? 'other',
            paid: item?.paid ?? false,
          }
          if (scope === GLOBAL_SCOPE) {
            return { trip: { ...s.trip, globalBudget: [...s.trip.globalBudget, newItem] } }
          }
          return {
            trip: {
              ...s.trip,
              points: s.trip.points.map((p) =>
                p.id === scope ? { ...p, budget: [...p.budget, newItem] } : p,
              ),
            },
          }
        }),

      updateBudgetItem: (scope, itemId, patch) =>
        set((s) => {
          const apply = (items: BudgetItem[]) =>
            items.map((it) => (it.id === itemId ? { ...it, ...patch } : it))
          if (scope === GLOBAL_SCOPE) {
            return { trip: { ...s.trip, globalBudget: apply(s.trip.globalBudget) } }
          }
          return {
            trip: {
              ...s.trip,
              points: s.trip.points.map((p) =>
                p.id === scope ? { ...p, budget: apply(p.budget) } : p,
              ),
            },
          }
        }),

      removeBudgetItem: (scope, itemId) =>
        set((s) => {
          const drop = (items: BudgetItem[]) => items.filter((it) => it.id !== itemId)
          if (scope === GLOBAL_SCOPE) {
            return { trip: { ...s.trip, globalBudget: drop(s.trip.globalBudget) } }
          }
          return {
            trip: {
              ...s.trip,
              points: s.trip.points.map((p) =>
                p.id === scope ? { ...p, budget: drop(p.budget) } : p,
              ),
            },
          }
        }),

      resetTrip: () => set({ trip: emptyTrip(), selectedPointId: null }),
      replaceTrip: (trip) => set({ trip }),
    }),
    { name: 'viaggio-trip-v1' },
  ),
)

// ---- Derived helpers (pure functions, not selectors) ----

export const pointsInOrder = (trip: Trip): TripPoint[] =>
  [...trip.points].sort((a, b) => a.order - b.order)

const allItems = (trip: Trip): BudgetItem[] => [
  ...trip.points.flatMap((p) => p.budget),
  ...trip.globalBudget,
]

export const budgetTotal = (trip: Trip): number =>
  allItems(trip).reduce((sum, it) => sum + (it.amount || 0), 0)

export const budgetRemaining = (trip: Trip): number =>
  allItems(trip)
    .filter((it) => !it.paid)
    .reduce((sum, it) => sum + (it.amount || 0), 0)

export const pointSubtotal = (point: TripPoint): number =>
  point.budget.reduce((sum, it) => sum + (it.amount || 0), 0)
