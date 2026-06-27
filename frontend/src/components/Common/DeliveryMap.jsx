import React, { useEffect, useRef } from 'react'

const DeliveryMap = ({
  driverLocation = null,
  driverName = 'Driver',
  height = '400px',
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const driverMarkerRef = useRef(null)
  const leafletRef = useRef(null)

  // Load Leaflet dynamically from CDN
  useEffect(() => {
    if (window.L) {
      leafletRef.current = window.L
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => {
      leafletRef.current = window.L
    }
    document.head.appendChild(script)
  }, [])

  // Initialize map once Leaflet and driver location are ready
  useEffect(() => {
    if (!driverLocation || !mapRef.current || mapInstanceRef.current) return

    const init = () => {
      const L = window.L
      if (!L) return

      const { lat, lng } = driverLocation

      const map = L.map(mapRef.current).setView([lat, lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const driverIcon = L.divIcon({
        className: '',
        html: `<div style="background:#10b981;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);">🚚</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      })

      driverMarkerRef.current = L.marker([lat, lng], { icon: driverIcon })
        .addTo(map)
        .bindPopup(`<b>${driverName}</b><br>Posisi saat ini`)
        .openPopup()

      mapInstanceRef.current = map
    }

    if (window.L) {
      init()
    } else {
      const check = setInterval(() => {
        if (window.L) {
          clearInterval(check)
          init()
        }
      }, 200)
    }
  }, [driverLocation, driverName])

  // Update driver marker on location change
  useEffect(() => {
    if (!mapInstanceRef.current || !driverMarkerRef.current || !driverLocation)
      return
    const { lat, lng } = driverLocation
    driverMarkerRef.current.setLatLng([lat, lng])
    mapInstanceRef.current.panTo([lat, lng])
  }, [driverLocation])

  const hasLocation = driverLocation || null

  return (
    <div className="relative">
      {hasLocation ? (
        <div
          ref={mapRef}
          style={{ height, borderRadius: '12px' }}
          className="w-full border-2 border-gray-200 shadow-sm overflow-hidden"
        />
      ) : (
        <div
          style={{ height }}
          className="w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 flex flex-col items-center justify-center gap-3"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-3xl">
            🗺️
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">
              Menunggu lokasi driver...
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Peta akan aktif saat pengiriman dimulai
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryMap
