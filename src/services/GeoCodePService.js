export const GeoCodePService = async (placeName) => {
    const url = `${import.meta.env.VITE_PHOTON_API}/?q=${encodeURIComponent(placeName)}&limit=1&lang=en`

    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.features && data.features[0]) {
        const feature = data.features[0]
        const coords = { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] }
        const name = feature.properties.name
        return { name, coords, error: null }
      } else {
        return { name: null, coords: null, error: 'GeoCode 2 failed' }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return { name: null, coords: null, error: 'GeoCode 2 failed' }
    }
}
