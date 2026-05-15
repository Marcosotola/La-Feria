'use client'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const pinIcon = L.divIcon({
  html: `
    <div style="position:relative;width:32px;height:44px;filter:drop-shadow(0 3px 10px rgba(0,0,0,0.4))">
      <div style="
        width:32px;height:32px;
        background:#0d9488;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
      "></div>
      <div style="
        position:absolute;top:8px;left:8px;
        width:12px;height:12px;
        background:white;border-radius:50%;
        transform:rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  className: ''
})

function MapFlyTo({ flyKey, lat, lng, zoom }) {
  const map = useMap()
  const prevKey = useRef(flyKey)
  useEffect(() => {
    if (flyKey !== prevKey.current) {
      prevKey.current = flyKey
      map.flyTo([lat, lng], zoom, { duration: 1 })
    }
  }, [flyKey])
  return null
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng)
  })
  return null
}

function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null)
  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      icon={pinIcon}
      eventHandlers={{
        dragend: () => {
          if (markerRef.current) {
            const { lat, lng } = markerRef.current.getLatLng()
            onDragEnd(lat, lng)
          }
        }
      }}
    />
  )
}

export default function LocationPickerMap({ position, flyKey, flyZoom = 16, onPositionChange, onMapClick }) {
  return (
    <MapContainer
      center={[-31.417, -64.183]}
      zoom={13}
      style={{ height: '320px', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && (
        <DraggableMarker position={position} onDragEnd={onPositionChange} />
      )}
      <MapClickHandler onMapClick={onMapClick} />
      {position && (
        <MapFlyTo
          flyKey={flyKey}
          lat={position[0]}
          lng={position[1]}
          zoom={flyZoom}
        />
      )}
    </MapContainer>
  )
}
