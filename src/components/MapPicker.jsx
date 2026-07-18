import { useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

export function MapPicker({ latitude, longitude, onChange }) {
  const position = useMemo(() => [
    Number(latitude) || 22.572645,
    Number(longitude) || 88.363892,
  ], [latitude, longitude])

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#dde5da] bg-white">
      <MapContainer center={position} zoom={15} scrollWheelZoom className="h-[280px] w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onChange={onChange} />
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
