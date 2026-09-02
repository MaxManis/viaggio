import type { TripPoint } from '../types'
import { appleMapsPointUrl, googleMapsPointUrl, wazePointUrl } from '../lib/navlinks'

export default function NavLinks({ point }: { point: TripPoint }) {
  return (
    <div className="navlinks">
      <a
        className="navlinks__btn"
        href={googleMapsPointUrl(point)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Google Maps
      </a>
      <a
        className="navlinks__btn"
        href={wazePointUrl(point)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Waze
      </a>
      <a
        className="navlinks__btn"
        href={appleMapsPointUrl(point)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Apple Maps
      </a>
    </div>
  )
}
