import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { pointsInOrder, useTripStore } from '../store/useTripStore'
import { useRouteContext } from '../hooks/useRoute'
import { useUI } from '../ui/ui'

const ITALY_CENTER: [number, number] = [42.6, 12.6]
type Layer = 'map' | 'sat'

function numberedIcon(n: number, active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'trip-marker',
    html: `<div class="trip-marker__pin${active ? ' trip-marker__pin--active' : ''}"><span>${n}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })
}

/** Drop a new stop wherever the map is clicked. */
function ClickToAdd() {
  const addPoint = useTripStore((s) => s.addPoint)
  useMapEvents({
    click(e) {
      addPoint(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/** Recenter the map when a stop is selected. */
function FlyToSelected() {
  const map = useMap()
  const selectedPointId = useTripStore((s) => s.selectedPointId)
  const points = useTripStore((s) => s.trip.points)
  useEffect(() => {
    if (!selectedPointId) return
    const p = points.find((pt) => pt.id === selectedPointId)
    if (p) map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 9), { duration: 0.6 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPointId])
  return null
}

export default function MapView() {
  const trip = useTripStore((s) => s.trip)
  const selectedPointId = useTripStore((s) => s.selectedPointId)
  const selectPoint = useTripStore((s) => s.selectPoint)
  const { route } = useRouteContext()
  const { isMobile, setView } = useUI()

  const points = pointsInOrder(trip)
  const straight = points.map((p) => [p.lat, p.lng] as [number, number])

  const [layer, setLayer] = useState<Layer>(
    () => (localStorage.getItem('viaggio-layer') as Layer) || 'map',
  )
  useEffect(() => {
    localStorage.setItem('viaggio-layer', layer)
  }, [layer])

  const onMarkerClick = (id: string) => {
    selectPoint(id)
    if (isMobile) setView('list') // jump to the editor on phones
  }

  return (
    <div className="mapwrap">
      <MapContainer center={ITALY_CENTER} zoom={6} className="map">
        {layer === 'sat' ? (
          <>
            <TileLayer
              key="esri-sat"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics"
              maxZoom={19}
            />
            <TileLayer
              key="esri-labels"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </>
        ) : (
          <TileLayer
            key="osm"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        {route ? (
          <Polyline
            positions={route.coordinates}
            pathOptions={{ color: '#2b6cb0', weight: 5, opacity: 0.85 }}
          />
        ) : straight.length > 1 ? (
          <Polyline
            positions={straight}
            pathOptions={{ color: '#2b6cb0', weight: 3, dashArray: '6 8', opacity: 0.7 }}
          />
        ) : null}

        {points.map((p, i) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={numberedIcon(i + 1, p.id === selectedPointId)}
            eventHandlers={{ click: () => onMarkerClick(p.id) }}
          />
        ))}

        <ClickToAdd />
        <FlyToSelected />
      </MapContainer>

      <div className="layer-toggle" role="group" aria-label="Map style">
        <button className={layer === 'map' ? 'is-active' : ''} onClick={() => setLayer('map')}>
          Map
        </button>
        <button className={layer === 'sat' ? 'is-active' : ''} onClick={() => setLayer('sat')}>
          Satellite
        </button>
      </div>

      {points.length === 0 && <div className="map-hint">Tap the map to drop your first stop</div>}
    </div>
  )
}
