// Road routing via the public OSRM demo server (free, no API key).
// It's a best-effort demo endpoint — if it's slow or down, callers fall back to
// straight lines. To harden later, swap OSRM_BASE for OpenRouteService/GraphHopper
// (they need an API key) — the shape returned here stays the same.
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving/'

export type RouteResult = {
  /** Road geometry as [lat, lng] pairs, ready for Leaflet. */
  coordinates: [number, number][]
  distance: number // meters, total
  duration: number // seconds, total
  /** One entry per gap between consecutive stops (length = stops - 1). */
  legs: { distance: number; duration: number }[]
}

export async function fetchRoute(
  points: { lat: number; lng: number }[],
): Promise<RouteResult> {
  // OSRM expects lon,lat order.
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(';')
  const url = `${OSRM_BASE}${coords}?overview=full&geometries=geojson`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`)
  const json = await res.json()
  if (json.code !== 'Ok' || !json.routes?.length) {
    throw new Error(`OSRM: ${json.code ?? 'no route'}`)
  }
  const route = json.routes[0]
  return {
    coordinates: (route.geometry.coordinates as [number, number][]).map(
      ([lng, lat]) => [lat, lng] as [number, number],
    ),
    distance: route.distance,
    duration: route.duration,
    legs: (route.legs ?? []).map((l: { distance: number; duration: number }) => ({
      distance: l.distance,
      duration: l.duration,
    })),
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function formatDistance(meters: number): string {
  const km = meters / 1000
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`
}
