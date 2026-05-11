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
  
  // Encontrar la primera feria con coordenadas válidas para centrar
  const firstFairWithCoords = fairs.find(f => f.location && typeof f.location === 'object' && f.location.lat)
  const center = firstFairWithCoords 
    ? [firstFairWithCoords.location.lat, firstFairWithCoords.location.lng] 
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
      
      {fairs.map((fair) => {
        // Solo renderizar si tiene coordenadas válidas
        if (!fair.location || typeof fair.location !== 'object' || !fair.location.lat) return null;
        
        return (
          <Marker 
            key={fair.id} 
            position={[fair.location.lat, fair.location.lng]} 
            icon={customIcon}
            eventHandlers={{
              click: () => onSelect(fair)
            }}
          />
        )
      })}
    </MapContainer>
  )
}
