import { ArrowUp, ArrowRight, ArrowLeft, RotateCw, ArrowUpRight, ArrowUpLeft, CornerDownRight, CornerDownLeft, Navigation } from 'lucide-react'
import styles from './DirectionArrow.module.css'

const DirectionArrow = ({ direction = 'straight', bearing = 0 }) => {
  const getArrowIcon = () => {
    switch (direction) {
      case 'straight':
        return <ArrowUp size={64} />
      case 'right':
        return <ArrowRight size={64} />
      case 'slight_right':
      case 'slight-right':
        return <ArrowUpRight size={64} />
      case 'left':
        return <ArrowLeft size={64} />
      case 'slight_left':
      case 'slight-left':
        return <ArrowUpLeft size={64} />
      case 'sharp_right':
      case 'sharp-right':
        return <CornerDownRight size={64} />
      case 'sharp_left':
      case 'sharp-left':
        return <CornerDownLeft size={64} />
      case 'uturn':
        return <RotateCw size={64} />
      case 'roundabout':
        return <Navigation size={64} />
      case 'arrive':
        return <Navigation size={64} color="green" />
      default:
        return <ArrowUp size={64} />
    }
  }

  const getDirectionLabel = () => {
    const labels = {
      'straight': 'Go Straight',
      'right': 'Turn Right',
      'slight_right': 'Turn Slight Right',
      'slight-right': 'Turn Slight Right',
      'left': 'Turn Left',
      'slight_left': 'Turn Slight Left',
      'slight-left': 'Turn Slight Left',
      'sharp_right': 'Sharp Right Turn',
      'sharp-right': 'Sharp Right Turn',
      'sharp_left': 'Sharp Left Turn',
      'sharp-left': 'Sharp Left Turn',
      'uturn': 'U-Turn',
      'roundabout': 'Enter Roundabout',
      'arrive': 'Destination Reached'
    }
    return labels[direction] || 'Continue'
  }

  return (
    <div className={styles.container}>
      <div className={styles.arrowBox}>
        {getArrowIcon()}
      </div>
      <p className={styles.label}>{getDirectionLabel()}</p>
      <p className={styles.bearing}>Bearing: {bearing}°</p>
    </div>
  )
}

export default DirectionArrow
