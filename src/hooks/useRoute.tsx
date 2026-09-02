import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { pointsInOrder, useTripStore } from '../store/useTripStore'
import { fetchRoute, type RouteResult } from '../lib/routing'

type RouteState = { route: RouteResult | null; status: 'idle' | 'loading' | 'error' }

const RouteContext = createContext<RouteState>({ route: null, status: 'idle' })

export const useRouteContext = () => useContext(RouteContext)

/**
 * Computes the driving route through all stops (in order) once and shares it with
 * the map, the route bar, and the per-leg times in the list. Refetches only when
 * the ordered coordinates change, and caches results so reordering is instant.
 */
export function RouteProvider({ children }: { children: ReactNode }) {
  const trip = useTripStore((s) => s.trip)
  const points = pointsInOrder(trip).map((p) => ({ lat: p.lat, lng: p.lng }))
  const key = points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join(';')

  const [state, setState] = useState<RouteState>({ route: null, status: 'idle' })
  const cache = useRef<Map<string, RouteResult>>(new Map())

  useEffect(() => {
    if (points.length < 2) {
      setState({ route: null, status: 'idle' })
      return
    }
    const cached = cache.current.get(key)
    if (cached) {
      setState({ route: cached, status: 'idle' })
      return
    }
    let cancelled = false
    setState((s) => ({ route: s.route, status: 'loading' }))
    const t = setTimeout(async () => {
      try {
        const r = await fetchRoute(points)
        if (cancelled) return
        cache.current.set(key, r)
        setState({ route: r, status: 'idle' })
      } catch {
        if (!cancelled) setState((s) => ({ route: s.route, status: 'error' }))
      }
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // Keyed on the coordinate signature; `points` is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return <RouteContext.Provider value={state}>{children}</RouteContext.Provider>
}
