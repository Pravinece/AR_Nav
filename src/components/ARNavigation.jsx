import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import DirectionArrow from './DirectionArrow'
import { Button } from './Button'
import styles from './ARNavigation.module.css'

const ARNavigation = ({ steps, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [deviceHeading, setDeviceHeading] = useState(0)
  const [userLocation, setUserLocation] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Request device orientation permission (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation)
          }
        })
        .catch(console.error)
    } else {
      // Non-iOS 13 devices
      window.addEventListener('deviceorientation', handleDeviceOrientation)
    }

    // Get user location
    navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => console.error('Location error:', error)
    )

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
    }
  }, [])

  const handleDeviceOrientation = (event) => {
    let heading = event.alpha // 0-360 degrees
    if (event.webkitCompassHeading !== undefined) {
      heading = event.webkitCompassHeading
    }
    setDeviceHeading(Math.round(heading))
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]

  return (
    <div className={styles.container}>
      {/* Camera View */}
      <div className={styles.cameraView}>
        <video ref={videoRef} className={styles.video} autoPlay playsInline />
        <canvas ref={canvasRef} className={styles.canvas} />

        {/* Compass */}
        <div className={styles.compass}>
          <div className={styles.compassCircle}>
            <div className={styles.compassNeedle} style={{ transform: `rotate(${deviceHeading}deg)` }} />
            <span className={styles.compassText}>{deviceHeading}°</span>
          </div>
        </div>

        {/* Direction Arrow Overlay */}
        <div className={styles.directionOverlay}>
          <DirectionArrow direction={step?.direction} bearing={step?.bearing} />
        </div>

        {/* Step Info */}
        <div className={styles.stepInfo}>
          <p className={styles.instruction}>{step?.instruction}</p>
          <p className={styles.distance}>{(step?.distance).toFixed(0)}m</p>
          <p className={styles.stepCounter}>Step {currentStep + 1} of {steps.length}</p>
        </div>

        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      {/* Navigation Controls */}
      <div className={styles.controls}>
        <Button onClick={handlePrevStep} disabled={currentStep === 0}>
          Previous
        </Button>
        <Button onClick={handleNextStep} disabled={currentStep === steps.length - 1}>
          Next
        </Button>
      </div>
    </div>
  )
}

export default ARNavigation
