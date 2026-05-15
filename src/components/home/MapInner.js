'use client'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapInner({ onSelect, fairs = [] }) {
  const customIcon = L.divIcon({
    html: `
      <div style="position:relative;width:52px;height:64px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.45));cursor:pointer;">
        <div style="
          width:52px;
          height:52px;
          background:#ffffff;
          border-radius:50%;
          border:3px solid #E8613C;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
          box-sizing:border-box;
        ">
          <img src="/icon-192.png" style="width:36px;height:36px;object-fit:contain;" alt="" />
        </div>
        <div style="
          width:0;
          height:0;
          border-left:10px solid transparent;
          border-right:10px solid transparent;
          border-top:14px solid #E8613C;
          margin:0 auto;
          margin-top:-1px;
        "></div>
      </div>
    `,
    iconSize: [52, 64],
    iconAnchor: [26, 64],
    popupAnchor: [0, -64],
    className: ''
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
