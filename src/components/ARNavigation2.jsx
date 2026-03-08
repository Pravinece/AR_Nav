import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import DirectionArrow from './DirectionArrow'
import { Button } from './Button'
import { getDirectionFromManeuver, getInstructionText } from '../utils/maneuverMapping'
import styles from './ARNavigation.module.css'

const ARNavigation2 = ({ steps, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [deviceHeading, setDeviceHeading] = useState(0)
  const [userLocation, setUserLocation] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Initialize camera
    initCamera()

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
      // Stop camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera access error:', error)
      alert('Camera access denied. Please allow camera permissions and try again.')
    }
  }

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
  const direction = step ? getDirectionFromManeuver(step.maneuver) : 'straight'
  const instruction = step ? getInstructionText(step.maneuver, step.name) : 'Continue straight'

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
          <DirectionArrow 
            direction={direction} 
            bearing={step?.maneuver?.bearing_after || 0} 
          />
        </div>

        {/* Step Info */}
        <div className={styles.stepInfo}>
          <p className={styles.instruction}>{instruction}</p>
          <p className={styles.distance}>{step ? (step.distance || 0).toFixed(0) : 0}m</p>
          <p className={styles.stepCounter}>Step {currentStep + 1} of {steps.length}</p>
          <p className={styles.maneuverInfo}>
            Type: {step?.maneuver?.type || 'N/A'} | 
            Modifier: {step?.maneuver?.modifier || 'N/A'} | 
            Driving Side: {step?.driving_side || 'N/A'}
          </p>
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

export default ARNavigation2
