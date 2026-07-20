import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const defaultPosition = [28.613939, 77.209023]

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function MapEvents({ onChange }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function RecenterMap({ position }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true })
  }, [map, position])

  return null
}

export function MapPicker({ latitude, longitude, onChange }) {
  const position = useMemo(() => [
    Number(latitude) || defaultPosition[0],
    Number(longitude) || defaultPosition[1],
  ], [latitude, longitude])

  return (
    <div className="overflow-hidden rounded-[18px] border border-white/70 bg-white shadow-[0_18px_42px_rgba(23,63,42,0.13),0_1px_0_rgba(255,255,255,0.9)_inset]">
      <MapContainer center={position} zoom={15} scrollWheelZoom className="h-[280px] w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onChange={onChange} />
        <RecenterMap position={position} />
        <Marker
          draggable
          eventHandlers={{
            dragend(event) {
              const point = event.target.getLatLng()
              onChange(point.lat, point.lng)
            },
          }}
          icon={markerIcon}
          position={position}
        />
      </MapContainer>
    </div>
  )
}
