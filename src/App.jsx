import { useState, useEffect, useRef } from 'react'
import { Navigation, MapPin } from 'lucide-react'
import { Button } from './components/Button'
import { Input } from './components/Input'
import { Card, CardHeader, CardTitle, CardContent } from './components/Card'
// import ARNavigation from './components/ARNavigation'
import LiveMapRender from './components/LiveMapRender'
import { getRouteWithSteps } from './services/RouteService'
import styles from './App.module.css'

function App() {
  const [destination, setDestination] = useState('')
  const [destinationCoords, setDestinationCoords] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [map, setMap] = useState(null)
  const [routeSteps, setRouteSteps] = useState(null)
  const [showAR, setShowAR] = useState(false)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return
    
    const L = window.L
    const mapInstance = L.map(mapRef.current).setView([51.505, -0.09], 13)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(mapInstance)

    mapInstance.on('click', (e) => {
      const { lat, lng } = e.latlng
      setDestination(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      setDestinationCoords({ lat, lng })
      window.L.marker([lat, lng]).addTo(mapInstance).bindPopup('Destination')
    })

    setMap(mapInstance)
  }, [])

  const geocodePlace = async (placeName) => {
    const url = `${import.meta.env.VITE_PHOTON_API}/?q=${encodeURIComponent(placeName)}&limit=1&lang=en`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.features && data.features[0]) {
        const feature = data.features[0]
        const coords = { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] }
        const name = feature.properties.name
        setDestinationCoords(coords)
        
        if (map) {
          map.setView([coords.lat, coords.lng], 13)
          window.L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(name).openPopup()
        }
        
        console.log('Geocoded:', name, coords)
        return coords
      } else {
        console.error('Place not found')
        return null
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  const handleGetRoute = async () => {
    if (!destination) {
      console.error('Please enter a destination')
      return
    }

    let destCoords = destinationCoords
    destCoords = await geocodePlace(destination)
    console.log('destCoords: ', destCoords)

    if (!destCoords) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setCurrentLocation(loc)
        console.log('Current Location:', loc)
        
        if (map) {
          map.setView([loc.lat, loc.lng], 15)
          window.L.marker([loc.lat, loc.lng]).addTo(map).bindPopup('You are here').openPopup()
        }
        
        await getRoute(loc, destCoords)
      },
      (error) => {
        console.error('Geolocation error:', error.message)
        console.error('Error code:', error.code)
        alert('Location access denied or unavailable. Make sure:\n1. You\'re on HTTPS or localhost\n2. Browser has location permission\n3. GPS is enabled')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const getRoute = async (source, dest) => {
    const routeData = await getRouteWithSteps(source, dest)
    
    if (routeData) {
      setRouteSteps(routeData.steps)
      
      const coords = routeData.coordinates.map(c => [c[1], c[0]])
      // coords.unshift([source.lat, source.lng])
      console.log('coords: ', coords);
      window.L.polyline(coords, { color: 'red', weight: 5 }).addTo(map)
      // window.L.marker([dest.lat, dest.lng]).addTo(map).bindPopup('Destination')
      window.L.marker([source.lat, source.lng])
      .addTo(map)
      .bindPopup('You are here (GPS)')
      .openPopup()

    // Show snapped-to-road marker so you can see the difference
    window.L.circleMarker(
      [routeData.snappedStart.lat, routeData.snappedStart.lng],
      { radius: 6, color: 'green', fillOpacity: 1 }
    ).addTo(map).bindPopup('Route start (road)')

    window.L.marker([dest.lat, dest.lng])
      .addTo(map)
      .bindPopup('Destination')

    // Fit map to show full route
    map.fitBounds(coords)

    }
  }
  

  // if (showAR && routeSteps) {
  //   return <ARNavigation steps={routeSteps} onClose={() => setShowAR(false)} />
  // }

  if (showAR && routeSteps) {
    return <LiveMapRender steps={routeSteps} onClose={() => setShowAR(false)} />
  }

  return (
    <div className={styles.container}>
      <Card>
        <CardContent>
          <div className={styles.controls}>
            <Input 
              type="text" 
              placeholder="Enter place name or lat, lng" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            <Button onClick={handleGetRoute}>
              <Navigation size={16} style={{ marginRight: '8px' }} />
              Get Route
            </Button>
          </div>
          
          <div ref={mapRef} className={styles.map} />
          
          {routeSteps && (
            <Button onClick={() => setShowAR(true)} style={{ width: '100%', marginTop: '12px' }}>
              View Live Map
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App
