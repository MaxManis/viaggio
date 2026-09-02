import type { TripPoint } from '../types'

type LatLng = { lat: number; lng: number }
const ll = (p: LatLng) => `${p.lat},${p.lng}`

/** Navigate to a single stop (opens the app on mobile, web otherwise). */
export function googleMapsPointUrl(p: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${ll(p)}&travelmode=driving`
}

export function wazePointUrl(p: LatLng): string {
  return `https://waze.com/ul?ll=${p.lat}%2C${p.lng}&navigate=yes`
}

export function appleMapsPointUrl(p: LatLng): string {
  return `https://maps.apple.com/?daddr=${ll(p)}&dirflg=d`
}

/**
 * The whole route in Google Maps: first stop = origin, last = destination,
 * everything between = waypoints. Google's URL API reliably handles up to ~9
 * waypoints; beyond that it may drop the extras (see the tooltip in RouteBar).
 */
export function googleMapsRouteUrl(points: TripPoint[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return googleMapsPointUrl(points[0])

  const origin = points[0]
  const destination = points[points.length - 1]
  const waypoints = points.slice(1, -1).map(ll).join('|')

  const params = new URLSearchParams({
    api: '1',
    origin: ll(origin),
    destination: ll(destination),
    travelmode: 'driving',
  })
  let url = `https://www.google.com/maps/dir/?${params.toString()}`
  if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`
  return url
}
