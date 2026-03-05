export const getRouteWithSteps = async (source, dest) => {
  const url = `https://router.project-osrm.org/route/v1/foot/${source.lng},${source.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&steps=true&annotations=distance,duration`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.routes && data.routes[0]) {
      const route = data.routes[0]
      const steps = extractSteps(route)
      
      console.log('=== ROUTE DETAILS ===')
      console.log('Distance:', (route.distance / 1000).toFixed(2), 'km')
      console.log('Duration:', (route.duration / 60).toFixed(2), 'minutes')
      console.log('Steps:', steps)
      console.log('Full Route Data:', route)
      
      return {
        distance: route.distance,
        duration: route.duration,
        coordinates: route.geometry.coordinates,
        steps: steps,
        fullRoute: route
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
          const direction = getDirection(step.maneuver?.type)
          steps.push({
            id: `${legIndex}-${stepIndex}`,
            distance: step.distance,
            duration: step.duration,
            instruction: step.maneuver?.instruction || 'Continue',
            direction: direction,
            coordinates: step.geometry.coordinates,
            bearing: step.maneuver?.bearing_after || 0
          })
        })
      }
    })
  }
  
  return steps
}

const getDirection = (maneuverType) => {
  const directionMap = {
    'turn-sharp-right': 'sharp-right',
    'turn-right': 'right',
    'turn-slight-right': 'slight-right',
    'straight': 'straight',
    'turn-slight-left': 'slight-left',
    'turn-left': 'left',
    'turn-sharp-left': 'sharp-left',
    'uturn': 'uturn'
  }
  
  return directionMap[maneuverType] || 'straight'
}
