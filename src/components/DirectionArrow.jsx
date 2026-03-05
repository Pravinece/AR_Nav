import { ArrowUp, ArrowRight, ArrowLeft, RotateCw } from 'lucide-react'
import styles from './DirectionArrow.module.css'

const DirectionArrow = ({ direction = 'straight', bearing = 0 }) => {
  const getArrowIcon = () => {
    switch (direction) {
      case 'straight':
        return <ArrowUp size={64} />
      case 'right':
      case 'slight-right':
        return <ArrowRight size={64} />
      case 'left':
      case 'slight-left':
        return <ArrowLeft size={64} />
      case 'sharp-right':
        return <ArrowRight size={64} />
      case 'sharp-left':
        return <ArrowLeft size={64} />
      case 'uturn':
        return <RotateCw size={64} />
      default:
        return <ArrowUp size={64} />
    }
  }

  const getDirectionLabel = () => {
    const labels = {
      'straight': 'Go Straight',
      'right': 'Turn Right',
      'slight-right': 'Turn Slight Right',
      'left': 'Turn Left',
      'slight-left': 'Turn Slight Left',
      'sharp-right': 'Sharp Right',
      'sharp-left': 'Sharp Left',
      'uturn': 'U-Turn'
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
