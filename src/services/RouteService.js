import { getDirectionFromManeuver, getInstructionText } from '../utils/maneuverMapping'

export const getRouteWithSteps = async (source, dest) => {
  const url = `${import.meta.env.VITE_OSRM_API}/foot/${source.lng},${source.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&steps=true&annotations=distance,duration`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.routes && data.routes[0]) {
      const route = data.routes[0]
      const steps = extractSteps(route)
      const snappedStart = route.geometry.coordinates[0]  // [lng, lat]

      // console.log('=== ROUTE DETAILS ===')
      // console.log('Distance:', (route.distance / 1000).toFixed(2), 'km')
      // console.log('Duration:', (route.duration / 60).toFixed(2), 'minutes')
      // console.log('Steps:', steps)
      // console.log('Full Route Data:', route)
      
      return {
        distance:    route.distance,
        duration:    route.duration,
        coordinates: route.geometry.coordinates,  // ← use as-is, no unshift
        steps:       steps,
        snappedStart: { lng: snappedStart[0], lat: snappedStart[1] }
      }
      }
  } catch (error) {
    console.error('Routing error:', error)
    return null
  }
}

const extractSteps = (route) => {
  const steps = []
  
  if (route.legs) {
    route.legs.forEach((leg, legIndex) => {
      if (leg.steps) {
        leg.steps.forEach((step, stepIndex) => {
          const direction = getDirectionFromManeuver(step.maneuver)
          const instruction = getInstructionText(step.maneuver, step.name)
          
          steps.push({
            id: `${legIndex}-${stepIndex}`,
            distance: step.distance,
            duration: step.duration,
            instruction: instruction,
            direction: direction,
            coordinates: step.geometry.coordinates,
            bearing: step.maneuver?.bearing_after || 0,
            maneuver: step.maneuver,
            name: step.name || '',
            driving_side: step.driving_side || 'right',
            mode: step.mode || 'walking'
          })
        })
      }
    })
  }
  
  return steps
}
