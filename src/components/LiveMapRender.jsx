import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import styles from './LiveMapRender.module.css'

const LiveMapRender = ({ steps, onClose }) => {
  const mapRef             = useRef(null)
  const mapInstanceRef     = useRef(null)
  const userMarkerRef      = useRef(null)
  const polylineRef        = useRef(null)
  const watchIdRef         = useRef(null)
  const allRouteCoords     = useRef([])   // full route — never mutated
  const remainingCoords    = useRef([])   // shrinks as user moves

  //  Build full route coords from steps once 
  useEffect(() => {
    if (!steps?.length) return

    const coords = steps.flatMap(step =>
      (step.coordinates ?? []).map(c => [c[1], c[0]])  // [lng,lat] → [lat,lng]
    )
    allRouteCoords.current  = coords
    remainingCoords.current = [...coords]
  }, [steps])

  //  Init map 
  useEffect(() => {
    if (!mapRef.current) return

    const L = window.L
    const map = L.map(mapRef.current, { zoomControl: true })

    // ✅ Tile layer — required or map is blank
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    // Draw initial polyline once coords are ready
    if (allRouteCoords.current.length > 0) {
      drawPolyline(map)

      // Fit map to full route on open
      map.fitBounds(allRouteCoords.current)
    }

    return () => map.remove()
  }, [])

  // Start GPS tracking
  useEffect(() => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => updateUserLocation(pos.coords.latitude, pos.coords.longitude),
      (err) => console.error('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )

    return () => navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  // Draw polyline
  const drawPolyline = (map) => {
    const L = window.L

    if (polylineRef.current) map.removeLayer(polylineRef.current)

    if (remainingCoords.current.length > 1) {
      polylineRef.current = L.polyline(remainingCoords.current, {
        color:  '#2563eb',
        weight: 6,
        opacity: 0.85,
      }).addTo(map)
    }
  }

  // Find closest point index
  const findClosestIndex = (userLat, userLng, coords) => {
    let minDist = Infinity
    let index   = 0

    coords.forEach((coord, i) => {
      const dist = Math.sqrt(
        Math.pow(coord[0] - userLat, 2) +
        Math.pow(coord[1] - userLng, 2)
      )
      if (dist < minDist) { minDist = dist; index = i }
    })

    return index
  }

  // Update on GPS change
  const updateUserLocation = (lat, lng) => {
    const L   = window.L
    const map = mapInstanceRef.current
    if (!map) return

    // 1. Move or create user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng])
    } else {
      const html = `
        <div style="
          width: 20px; height: 20px;
          background: #2563eb;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.3);
        "></div>`

      userMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          html,
          iconSize:    [20, 20],
          iconAnchor:  [10, 10],
          className:   '',           // removes default Leaflet white box
        }),
        zIndexOffset: 1000,
      }).addTo(map)

      // On first fix — center map on user
      map.setView([lat, lng], 17)
    }

    // 2. Trim polyline — slice from closest point forward
    if (remainingCoords.current.length > 1) {
      const closestIdx = findClosestIndex(lat, lng, remainingCoords.current)

      // Only trim if user has actually moved past some points
      if (closestIdx > 0) {
        remainingCoords.current = remainingCoords.current.slice(closestIdx)
        drawPolyline(map)
      }
    }

    // 3. Pan map to follow user (no zoom change)
    map.panTo([lat, lng], { animate: true, duration: 0.5 })
  }

  return (
    <div className={styles.container}>
      <div ref={mapRef} className={styles.map} />

      <button className={styles.closeBtn} onClick={onClose}>
        <X size={24} />
      </button>
    </div>
  )
}

export default LiveMapRender