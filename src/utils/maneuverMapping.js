export const getDirectionFromManeuver = (maneuver) => {
  if (!maneuver) return 'straight'
  
  const { type, modifier } = maneuver
  
  // Handle specific maneuver types
  switch (type) {
    case 'depart':
      return getDirectionFromModifier(modifier) || 'straight'
    case 'arrive':
      return 'arrive'
    case 'turn':
      return getDirectionFromModifier(modifier) || 'straight'
    case 'continue':
      return getDirectionFromModifier(modifier) || 'straight'
    case 'new name':
      return getDirectionFromModifier(modifier) || 'straight'
    case 'end of road':
      return getDirectionFromModifier(modifier) || 'straight'
    case 'roundabout':
    case 'rotary':
      return 'roundabout'
    case 'merge':
      return getDirectionFromModifier(modifier) || 'merge'
    case 'fork':
      return getDirectionFromModifier(modifier) || 'fork'
    case 'on ramp':
      return getDirectionFromModifier(modifier) || 'on_ramp'
    case 'off ramp':
      return getDirectionFromModifier(modifier) || 'off_ramp'
    default:
      return getDirectionFromModifier(modifier) || 'straight'
  }
}

export   const getCurrentDirection = (currentStep) => {
  if (!currentStep?.maneuver) return 'straight'
  
  // Use your getDirectionFromManeuver utility
  return getDirectionFromManeuver(currentStep.maneuver)
}

export const getDirectionFromModifier = (modifier) => {
  switch (modifier) {
    case 'uturn':
      return 'uturn'
    case 'sharp right':
      return 'sharp_right'
    case 'right':
      return 'right'
    case 'slight right':
      return 'slight_right'
    case 'straight':
      return 'straight'
    case 'slight left':
      return 'slight_left'
    case 'left':
      return 'left'
    case 'sharp left':
      return 'sharp_left'
    default:
      return 'straight'
  }
}

export const getInstructionText = (maneuver, roadName = '') => {
  if (!maneuver) return 'Continue straight'
  
  const { type, modifier } = maneuver
  const road = roadName ? ` onto ${roadName}` : ''
  
  switch (type) {
    case 'depart':
      return `Start ${getModifierText(modifier)}${road}`
    case 'arrive':
      return 'You have arrived at your destination'
    case 'turn':
      return `${getModifierText(modifier)}${road}`
    case 'continue':
      return `Continue ${getModifierText(modifier)}${road}`
    case 'new name':
      return `Continue${road}`
    case 'end of road':
      return `At the end of the road, ${getModifierText(modifier)}${road}`
    case 'roundabout':
      return `Enter the roundabout and take the exit${road}`
    case 'merge':
      return `Merge ${getModifierText(modifier)}${road}`
    case 'fork':
      return `At the fork, keep ${getModifierText(modifier)}${road}`
    case 'on ramp':
      return `Take the ramp ${getModifierText(modifier)}${road}`
    case 'off ramp':
      return `Take the exit ${getModifierText(modifier)}${road}`
    default:
      return `${getModifierText(modifier)}${road}`
  }
}

export const getModifierText = (modifier) => {
  switch (modifier) {
    case 'uturn':
      return 'Make a U-turn'
    case 'sharp right':
      return 'Turn sharp right'
    case 'right':
      return 'Turn right'
    case 'slight right':
      return 'Turn slight right'
    case 'straight':
      return 'straight'
    case 'slight left':
      return 'Turn slight left'
    case 'left':
      return 'Turn left'
    case 'sharp left':
      return 'Turn sharp left'
    default:
      return 'continue'
  }
}  