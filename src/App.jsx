import { useState, useEffect, useRef } from 'react'
import { Navigation, MapPin } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { Button } from './components/Button'
import { Input } from './components/Input'
import { Card, CardHeader, CardTitle, CardContent } from './components/Card'
import LiveMapRender from './components/LiveMapRender'
import { getRouteWithSteps } from './services/RouteService'
import styles from './App.module.css'
import ARNavigation from './components/ARNavigation'
import { GeoCodeNService } from './services/GeoCodeNService'
import { GeoCodePService } from './services/GeoCodePService'

function App() {
  const [destination, setDestination] = useState('')
  const [destinationCoords, setDestinationCoords] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [map, setMap] = useState(null)
  const [routeSteps, setRouteSteps] = useState(null)
  const [showMap, setShowMap] = useState(false)
  console.log('showMap: ', showMap);
  const [loading, setLoading] = useState(false)
  const [showAR, setShowAR] = useState(false)
  console.log('showAR: ', showAR);
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)


  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    
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

    mapInstanceRef.current = mapInstance
    setMap(mapInstance)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const clearMapLayers = () => {
    if (!map) return
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker || 
          layer instanceof window.L.Polyline || 
          layer instanceof window.L.CircleMarker) {
        map.removeLayer(layer)
      }
    })
  }

  // nominatim
  const geocodePlace = async (placeName) => {
    try {
      let response = await GeoCodeNService(placeName)
      
      if (response?.error) {
        toast.error(response.error, {
          onClick: () => toast.error(response.error)
        })
        response = await GeoCodePService(placeName)
        
        if (response?.error) {
          toast.error(response.error, {
            onClick: () => toast.error(response.error)
          })
          toast.error('No data', {
            onClick: () => toast.error('No data')
          })
          return null
        }
      }
      
      const { name: display_name, coords } = response
      setDestinationCoords(coords)
      
      if (map) {
        map.setView([coords.lat, coords.lng], 13)
        window.L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(display_name).openPopup()
      }
      
      console.log('Geocoded:', display_name, coords)
      setLoading(false)
      return coords
    } catch (error) {
      console.error('Geocoding error:', error)
      toast.error('No data', {
        onClick: () => toast.error('No data')
      })
      setLoading(false)
      return null
    }
  }

  const handleGetRoute = async () => {
    if (!destination) {
      console.error('Please enter a destination')
      return
    }

    setLoading(true)
    clearMapLayers()

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
        toast.error('Location access denied or unavailable. Make sure:\n1. You\'re on HTTPS or localhost\n2. Browser has location permission\n3. GPS is enabled', {
          onClick: () => toast.error('Location access denied')
        })
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const getRoute = async (source, dest) => {
    const routeData = await getRouteWithSteps(source, dest)
    
    if (routeData) {
      setLoading(false)
      setRouteSteps(routeData.steps)
      
      const coords = routeData.coordinates.map(c => [c[1], c[0]])
      console.log('coords: ', coords);
      window.L.polyline(coords, { color: 'red', weight: 5 }).addTo(map)
      window.L.marker([source.lat, source.lng])
      .addTo(map)
      .bindPopup('You are here (GPS)')
      .openPopup()

      window.L.circleMarker(
        [routeData.snappedStart.lat, routeData.snappedStart.lng],
        { radius: 6, color: 'green', fillOpacity: 1 }
      ).addTo(map).bindPopup('Route start (road)')

      window.L.marker([dest.lat, dest.lng])
        .addTo(map)
        .bindPopup('Destination')

      map.fitBounds(coords)
    }
  }
  

  if (showAR && routeSteps) {
    return <ARNavigation steps={routeSteps} onClose={() => {console.log('hi');
     setShowAR(false),setShowMap(true)}}/>
  }

  if (showMap && routeSteps) {
    return <LiveMapRender steps={routeSteps} onClose={() => setShowMap(false)} setShowAR={()=> setShowAR(true)} />
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
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
              {loading? `Searching`:`Get Route`}
            </Button>
          </div>
          
          <div ref={mapRef} className={styles.map} />
          
          {routeSteps && (
            <Button onClick={() => setShowMap(true)} style={{ width: '100%', marginTop: '12px' }}>
              View Live Map
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App
