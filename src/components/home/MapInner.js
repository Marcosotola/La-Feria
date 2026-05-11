'use client'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapInner({ onSelect, fairs = [] }) {
  // Icono personalizado con el logo de La Feria
  const customIcon = new L.Icon({
    iconUrl: '/icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'drop-shadow-lg filter hover:scale-110 transition-transform cursor-pointer'
  })

  // Córdoba, Argentina por defecto
  const defaultCenter = [-31.417, -64.183]
  const center = fairs.length > 0 && fairs[0].location 
    ? [fairs[0].location.lat, fairs[0].location.lng] 
    : defaultCenter

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {fairs.map((fair) => (
        <Marker 
          key={fair.id} 
          position={[fair.location.lat, fair.location.lng]} 
          icon={customIcon}
          eventHandlers={{
            click: () => onSelect(fair)
          }}
        />
      ))}
    </MapContainer>
  )
}
