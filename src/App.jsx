import { useState, useEffect, useRef } from 'react'
import { Navigation, MapPin } from 'lucide-react'
import { Button } from './components/Button'
import { Input } from './components/Input'
import { Card, CardHeader, CardTitle, CardContent } from './components/Card'
import styles from './App.module.css'

function App() {
  const [destination, setDestination] = useState('')
  const [destinationCoords, setDestinationCoords] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [map, setMap] = useState(null)
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
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0]
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) }
        setDestinationCoords(coords)
        
        if (map) {
          map.setView([coords.lat, coords.lng], 13)
          window.L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(display_name).openPopup()
        }
        
        console.log('Geocoded:', display_name, coords)
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
        // error.code: 1 = Permission denied, 2 = Position unavailable, 3 = Timeout
        alert('Location access denied or unavailable. Make sure:\n1. You\'re on HTTPS or localhost\n2. Browser has location permission\n3. GPS is enabled')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const getRoute = async (source, dest) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0]
        console.log('=== ROUTE DETAILS ===')
        console.log('Distance:', (route.distance / 1000).toFixed(2), 'km')
        console.log('Duration:', (route.duration / 60).toFixed(2), 'minutes')
        console.log('Coordinates:', route.geometry.coordinates)
        console.log('Full Route Data:', route)
        
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]])
        window.L.polyline(coords, { color: 'red', weight: 5 }).addTo(map)
        window.L.marker([dest.lat, dest.lng]).addTo(map).bindPopup('Destination')
      }
    } catch (error) {
      console.error('Routing error:', error)
    }
  }

  return (
    <div className={styles.container}>
      <Card>
        {/* <CardHeader> */}
          {/* <CardTitle></CardTitle> */}
        {/* </CardHeader> */}
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
          
          <p className={styles.hint}>
            <MapPin size={14} style={{ marginRight: '4px' }} />
            Click on map to set destination. Check console for route details.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
