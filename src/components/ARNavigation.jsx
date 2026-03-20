import { useState, useEffect, useRef, useCallback } from 'react'
import { getCurrentDirection, getDirectionFromManeuver, getInstructionText } from '../utils/maneuverMapping'
import styles from '../components/ARNavigation.module.css'
import StraightArrow from './Arrows/StraightArrow'
import RightArrow from './Arrows/RightArrow'
import LeftArrow from './Arrows/LeftArrow'
import SlightRightArrow from './Arrows/SlightRightArrow'
import SlightLeftArrow from './Arrows/SlightLeftArrow'
import SharpRightArrow from './Arrows/SharpRightArrow'
import SharpLeftArrow from './Arrows/SharpLeftArrow'
import UTurnArrow from './Arrows/UTurnArrow'
import RoundaboutArrow from './Arrows/RoundaboutArrow'
import ArriveArrow from './Arrows/ArriveArrow'
import { Canvas } from '@react-three/fiber'
import { ARButton, XR } from '@react-three/xr'
import { ScrollText } from 'lucide-react'
import LogViewer from './LogViewer'

// ─── Constants ────────────────────────────────────────────────────────────────
const ARRIVAL_THRESHOLD_M = 15
const ALIGNED_THRESHOLD = 30

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const computeBearing = (fromLat, fromLng, toLat, toLng) => {
  const toRad = d => d * Math.PI / 180
  const dLng = toRad(toLng - fromLng)
  const lat1 = toRad(fromLat)
  const lat2 = toRad(toLat)
  const x = Math.sin(dLng) * Math.cos(lat2)
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360
}

const getHeadingDiff = (deviceHeading, routeBearing) => {
  let diff = routeBearing - deviceHeading
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return diff
}

// ─── Component ────────────────────────────────────────────────────────────────
const ARNavigation = ({ steps, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [deviceHeading, setDeviceHeading] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [arrived, setArrived] = useState(false)
  const [gpsReady, setGpsReady] = useState(false)
  const [isARActive, setIsARActive] = useState(false)
  const [xrSession, setXrSession] = useState(null)
  const [showLogs, setShowLogs] = useState(false)

  const watchIdRef = useRef(null)
  const currentStepRef = useRef(0)

  currentStepRef.current = currentStepIndex

  // ─── Compass / Device Orientation ─────────────────────────────────────────
  useEffect(() => {
    const handleOrientation = (e) => {
      let heading
      if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading
      } else if (e.absolute === true) {
        heading = e.alpha
      } else {
        heading = 360 - e.alpha
      }
      setDeviceHeading(Math.round(heading))
    }
    const addListeners = () => {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true)
      window.addEventListener('deviceorientation', handleOrientation, true)
    }

    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(state => { if (state === 'granted') addListeners() })
        .catch(console.error)
    } else {
      addListeners()
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [])

  // ─── GPS Tracking ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!steps?.length) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setGpsReady(true)
        checkStepAdvance(loc)
      },
      (err) => console.error('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [steps])

  // ─── Auto Step Advance ────────────────────────────────────────────────────
  const checkStepAdvance = useCallback((loc) => {
    if (!steps?.length) return

    const idx = currentStepRef.current
    const step = steps[idx]
    if (!step) return

    const stepLng = step.maneuver?.location?.[0]
    const stepLat = step.maneuver?.location?.[1]
    if (stepLat == null || stepLng == null) return

    const dist = getDistanceMeters(loc.lat, loc.lng, stepLat, stepLng)
    console.log(`[AR] Step ${idx + 1}/${steps.length} — ${dist.toFixed(1)}m to waypoint`)

    if (dist < ARRIVAL_THRESHOLD_M) {
      if (idx >= steps.length - 1) {
        setArrived(true)
      } else {
        setCurrentStepIndex(idx + 1)
      }
    }
  }, [steps])

  // ─── Derived values ───────────────────────────────────────────────────────
  const currentStep = steps?.[currentStepIndex]

  const routeBearing = (() => {
    if (!currentStep) return 0
    const maneuverType = currentStep.maneuver?.type
    if (
      (maneuverType === 'depart' || maneuverType === 'continue' || maneuverType === 'new name') &&
      userLocation &&
      currentStep.maneuver?.location
    ) {
      const [nextLng, nextLat] = currentStep.maneuver.location
      return computeBearing(userLocation.lat, userLocation.lng, nextLat, nextLng)
    }
    return currentStep?.maneuver?.bearing_after ?? currentStep?.bearing ?? 0
  })()

  const headingDiff = deviceHeading !== null ? getHeadingDiff(deviceHeading, routeBearing) : null
  const isAligned = headingDiff !== null && Math.abs(headingDiff) < ALIGNED_THRESHOLD

  const instruction = currentStep
    ? getInstructionText(currentStep.maneuver, currentStep.name)
    : 'Loading…'

  const distanceToStep = (() => {
    if (!userLocation || !currentStep?.maneuver?.location) return null
    const [lng, lat] = currentStep.maneuver.location
    return getDistanceMeters(userLocation.lat, userLocation.lng, lat, lng)
  })()

  // Arrow configuration
  const arrows = [
    { id: 'straight', component: StraightArrow },
    { id: 'right', component: RightArrow },
    { id: 'left', component: LeftArrow },
    { id: 'slight_right', component: SlightRightArrow },
    { id: 'slight-right', component: SlightRightArrow },
    { id: 'slight_left', component: SlightLeftArrow },
    { id: 'slight-left', component: SlightLeftArrow },
    { id: 'sharp_right', component: SharpRightArrow },
    { id: 'sharp-right', component: SharpRightArrow },
    { id: 'sharp_left', component: SharpLeftArrow },
    { id: 'sharp-left', component: SharpLeftArrow },
    { id: 'uturn', component: UTurnArrow },
    { id: 'roundabout', component: RoundaboutArrow },
    { id: 'arrive', component: ArriveArrow },
  ]

  const direction = getCurrentDirection(currentStep)
  const CurrentArrow = (() => {
    if (distanceToStep === null) return StraightArrow
    if (distanceToStep > 40) return StraightArrow
    return arrows.find(a => a.id === direction)?.component || StraightArrow
  })()

  // ─── AR Session Handlers ──────────────────────────────────────────────────
  const handleSessionStart = (session) => {
    console.log('[AR] Session started')
    setXrSession(session)
    setIsARActive(true)
  }

  const handleSessionEnd = () => {
    console.log('[AR] Session ended')
    setIsARActive(false)
    setXrSession(null)
  }

  const handleExitAR = async () => {
    if (xrSession) {
      await xrSession.end()
      setIsARActive(false)
      setXrSession(null)
    }
  }

  // ─── Arrived screen ───────────────────────────────────────────────────────
  if (arrived) {
    return (
      <div className={styles.container}>
        <div className={styles.arrivedScreen}>
          <div className={styles.arrivedContent}>
            <span className={styles.arrivedEmoji}>🎉</span>
            <h2 className={styles.arrivedTitle}>You have arrived!</h2>
            <button className={styles.arrivedBtn} onClick={onClose}>
              Close Navigation
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>

      {/* Canvas with XR - pointer-events none so it doesn't block LogViewer */}
      <Canvas
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
      >
        <XR>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          <CurrentArrow
            deviceHeading={deviceHeading}
            routeBearing={routeBearing}
            distance={distanceToStep}
          />
        </XR>
      </Canvas>

      {/* AR Button */}
      <ARButton
        mode="AR"
        sessionInit={{
          requiredFeatures: ['local-floor'],
          optionalFeatures: ['dom-overlay', 'hit-test'],
        }}
        onSessionStart={handleSessionStart}
        onSessionEnd={handleSessionEnd}
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          padding: '16px 32px',
          fontSize: '18px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)',
          color: '#000',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 255, 0, 0.4)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      />

      {/* UI Overlay */}
      <div className={styles.overlay}>

        {/* Top bar buttons */}
        <div className={styles.topBar}>

          {/* Left: Back or Exit AR */}
          {!isARActive ? (
            <button className={styles.topBtn} onClick={onClose}>
              ← Back
            </button>
          ) : (
            <button className={styles.topBtn} onClick={handleExitAR}>
              ✕ Exit AR
            </button>
          )}

          {/* Right: Logs button - only when not in AR */}
          {!isARActive && (
            <button className={styles.topBtnBlue} onClick={() => setShowLogs(true)}>
              <ScrollText size={18} />
              Logs
            </button>
          )}
        </div>

        {/* GPS Status */}
        {!gpsReady && (
          <div className={styles.gpsWaiting}>
            📡 Acquiring GPS signal…
          </div>
        )}

        {/* Bottom instruction card */}
        <div className={styles.instructionCard}>
          {distanceToStep !== null && (
            <div className={styles.distanceRow}>
              <span className={styles.distanceValue}>
                {distanceToStep < 1000
                  ? `${Math.round(distanceToStep)} m`
                  : `${(distanceToStep / 1000).toFixed(1)} km`}
              </span>
              <span className={styles.distanceLabel}>to next turn</span>
            </div>
          )}
          <p className={styles.instruction}>{instruction}</p>
        </div>
      </div>

      {/* Log Viewer Modal - Outside overlay so it's fully interactive */}
      <LogViewer isOpen={showLogs} onClose={() => setShowLogs(false)} />
    </div>
  )
}

export default ARNavigation
