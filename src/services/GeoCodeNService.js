export const GeoCodeNService = async (placeName) => {
    const url = `${import.meta.env.VITE_NOMINATIM_API}/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`

    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0]
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) }
        const name = display_name
        return { name, coords, error: null }
      } else {
        return { name: null, coords: null, error: 'GeoCode 1 failed' }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return { name: null, coords: null, error: 'GeoCode 1 failed' }
    }
}
