export type BudgetCategory =
  | 'hotel'
  | 'fuel'
  | 'toll'
  | 'parking'
  | 'food'
  | 'activity'
  | 'other'

export type BudgetItem = {
  id: string
  label: string
  amount: number // in the trip currency
  category: BudgetCategory
  paid: boolean
}

export type Hotel = {
  name?: string
  address?: string
  checkIn?: string // ISO date (yyyy-mm-dd)
  checkOut?: string
  bookingRef?: string
  url?: string
}

export type TripPoint = {
  id: string
  name: string
  lat: number
  lng: number
  order: number
  arrivalDate?: string // ISO date
  nights?: number
  notes?: string
  hotel?: Hotel
  budget: BudgetItem[]
  /** Italy-specific: is this stop inside a ZTL (limited-traffic zone)? */
  inZTL?: boolean
}

export type Trip = {
  id: string
  name: string
  currency: string // ISO 4217, e.g. 'EUR'
  points: TripPoint[]
  /** Trip-wide costs not tied to a single stop: fuel, tolls, car rental… */
  globalBudget: BudgetItem[]
}
