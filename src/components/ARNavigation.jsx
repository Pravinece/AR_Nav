// import { useState, useEffect, useRef, useCallback } from 'react'
// import { X } from 'lucide-react'
// import { getInstructionText } from '../utils/maneuverMapping'
// import styles from '../components/ARNavigation.module.css'

// // ─── Constants ────────────────────────────────────────────────────────────────
// const ARRIVAL_THRESHOLD_M = 15   // auto-advance step within 15m of waypoint
// const ALIGNED_THRESHOLD   = 30   // degrees — within this = facing right way

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
//   const R    = 6371000
//   const dLat = (lat2 - lat1) * Math.PI / 180
//   const dLng = (lng2 - lng1) * Math.PI / 180
//   const a    =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLng / 2) ** 2
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
// }

// const getHeadingDiff = (deviceHeading, routeBearing) => {
//   let diff = routeBearing - deviceHeading
//   if (diff > 180)  diff -= 360
//   if (diff < -180) diff += 360
//   return diff
// }

// // ─── Component ───────────────────────────────────────────────────────────────
// const ARNavigation = ({ steps, onClose }) => {
//   const [currentStepIndex, setCurrentStepIndex] = useState(0)
//   const [deviceHeading,    setDeviceHeading]     = useState(null)
//   const [userLocation,     setUserLocation]      = useState(null)
//   const [arrived,          setArrived]           = useState(false)
//   const [cameraError,      setCameraError]       = useState(false)
//   const [gpsReady,         setGpsReady]          = useState(false)

//   const videoRef          = useRef(null)
//   const watchIdRef        = useRef(null)
//   const currentStepRef    = useRef(0)   // ref copy so watchPosition callback always has latest

//   // Keep ref in sync with state
//   useEffect(() => {
//     currentStepRef.current = currentStepIndex
//   }, [currentStepIndex])

//   // ─── Camera ──────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             facingMode: 'environment',
//             width:  { ideal: 1280 },
//             height: { ideal: 720  },
//           },
//           audio: false,
//         })
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream
//         }
//       } catch (err) {
//         console.error('Camera error:', err)
//         setCameraError(true)
//       }
//     }

//     startCamera()

//     return () => {
//       if (videoRef.current?.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach(t => t.stop())
//       }
//     }
//   }, [])

//   // ─── Compass ─────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const handleOrientation = (e) => {
//       // iOS: webkitCompassHeading is already true north, clockwise
//       // Android: alpha is counter-clockwise from north, so we invert
//       const heading = e.webkitCompassHeading !== undefined
//         ? e.webkitCompassHeading
//         : 360 - e.alpha
//       setDeviceHeading(Math.round(heading))
//     }

//     const addListeners = () => {
//       // deviceorientationabsolute is more accurate on Android
//       window.addEventListener('deviceorientationabsolute', handleOrientation, true)
//       window.addEventListener('deviceorientation',         handleOrientation, true)
//     }

//     // iOS 13+ requires explicit user-gesture permission
//     if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
//       DeviceOrientationEvent.requestPermission()
//         .then(state => { if (state === 'granted') addListeners() })
//         .catch(console.error)
//     } else {
//       addListeners()
//     }

//     return () => {
//       window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
//       window.removeEventListener('deviceorientation',         handleOrientation, true)
//     }
//   }, [])

//   // ─── GPS + Auto Step Advance ──────────────────────────────────────────────
//   useEffect(() => {
//     if (!steps?.length) return

//     watchIdRef.current = navigator.geolocation.watchPosition(
//       (pos) => {
//         const loc = {
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         }
//         setUserLocation(loc)
//         setGpsReady(true)
//         checkStepAdvance(loc)
//       },
//       (err) => console.error('GPS error:', err.message),
//       { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
//     )

//     return () => {
//       if (watchIdRef.current) {
//         navigator.geolocation.clearWatch(watchIdRef.current)
//       }
//     }
//   }, [steps])

//   // ─── Step Advance Logic ───────────────────────────────────────────────────
//   // Uses ref (not state) so the watchPosition callback always reads latest index
//   const checkStepAdvance = useCallback((loc) => {
//     if (!steps?.length) return

//     const idx  = currentStepRef.current
//     const step = steps[idx]
//     if (!step) return

//     // OSRM maneuver.location = [lng, lat]
//     const stepLng = step.maneuver?.location?.[0]
//     const stepLat = step.maneuver?.location?.[1]
//     if (stepLat == null || stepLng == null) return

//     const dist = getDistanceMeters(loc.lat, loc.lng, stepLat, stepLng)
//     console.log(`[AR] Step ${idx + 1}/${steps.length} — ${dist.toFixed(1)}m to waypoint`)

//     if (dist < ARRIVAL_THRESHOLD_M) {
//       if (idx >= steps.length - 1) {
//         // Last step reached → destination
//         setArrived(true)
//       } else {
//         // Advance to next step
//         setCurrentStepIndex(idx + 1)
//       }
//     }
//   }, [steps])

//   // ─── Derived values ───────────────────────────────────────────────────────
//   const currentStep  = steps?.[currentStepIndex]
//   const routeBearing = currentStep?.bearing ?? currentStep?.maneuver?.bearing_after ?? 0
//   const headingDiff  = deviceHeading !== null
//     ? getHeadingDiff(deviceHeading, routeBearing)
//     : null
//   const isAligned    = headingDiff !== null && Math.abs(headingDiff) < ALIGNED_THRESHOLD

//   const instruction  = currentStep
//     ? getInstructionText(currentStep.maneuver, currentStep.name)
//     : 'Loading…'

//   const distanceToStep = (() => {
//     if (!userLocation || !currentStep?.maneuver?.location) return null
//     const [lng, lat] = currentStep.maneuver.location
//     return getDistanceMeters(userLocation.lat, userLocation.lng, lat, lng)
//   })()

//   const getHeadingInstruction = () => {
//     if (deviceHeading === null) return '📡 Waiting for compass…'
//     if (!isAligned) {
//       const abs = Math.abs(Math.round(headingDiff))
//       return headingDiff > 0
//         ? `↩️ Turn right ${abs}°`
//         : `↪️ Turn left ${abs}°`
//     }
//     return '✅ Go straight ahead'
//   }

//   // ─── Arrived Screen ───────────────────────────────────────────────────────
//   if (arrived) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.arrivedScreen}>
//           <div className={styles.arrivedContent}>
//             <span className={styles.arrivedEmoji}>🎉</span>
//             <h2 className={styles.arrivedTitle}>You have arrived!</h2>
//             <button className={styles.arrivedBtn} onClick={onClose}>
//               Close Navigation
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // ─── Main Render ──────────────────────────────────────────────────────────
//   return (
//     <div className={styles.container}>

//       {cameraError ? (
//         <div className={styles.cameraError}>
//           📷 Camera unavailable — running in map-only mode
//         </div>
//       ) : (
//         <video
//           ref={videoRef}
//           className={styles.video}
//           autoPlay
//           playsInline
//           muted
//         />
//       )}

//       {/* Overlay — everything on top of camera */}
//       <div className={styles.overlay}>

//         {/* ── Top bar ── */}
//         <div className={styles.topBar}>
//           <div className={styles.stepPill}>
//             Step {currentStepIndex + 1} / {steps?.length ?? 0}
//           </div>

//           <button className={styles.closeBtn} onClick={onClose}>
//             <X size={20} />
//           </button>
//         </div>

//         {/* ── GPS waiting indicator ── */}
//         {!gpsReady && (
//           <div className={styles.gpsWaiting}>
//             📡 Acquiring GPS signal…
//           </div>
//         )}

//         {/* ── Bottom instruction card ── */}
//         <div className={styles.instructionCard}>

//           {/* Distance to next waypoint — big and prominent */}
//           {distanceToStep !== null && (
//             <div className={styles.distanceRow}>
//               <span className={styles.distanceValue}>
//                 {distanceToStep < 1000
//                   ? `${Math.round(distanceToStep)} m`
//                   : `${(distanceToStep / 1000).toFixed(1)} km`
//                 }
//               </span>
//               <span className={styles.distanceLabel}>to next turn</span>
//             </div>
//           )}

//           {/* OSRM turn instruction */}
//           <p className={styles.instruction}>{instruction}</p>

//           {/* Heading alignment feedback */}
//           <div className={`${styles.headingFeedback} ${isAligned ? styles.aligned : styles.misaligned}`}>
//             {getHeadingInstruction()}
//           </div>

//           {/* Compass + bearing debug row */}
//           <div className={styles.debugRow}>
//             <span>🧭 {deviceHeading ?? '…'}°</span>
//             <span>🗺 bearing {routeBearing}°</span>
//             <span>📐 diff {headingDiff !== null ? `${Math.round(headingDiff)}°` : '…'}</span>
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }

// export default ARNavigation
import { useState, useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { getInstructionText } from '../utils/maneuverMapping'
import styles from '../components/ARNavigation.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────
const ARRIVAL_THRESHOLD_M = 15  // auto-advance step within 15m of waypoint
const ALIGNED_THRESHOLD   = 30  // degrees — within this = facing right way

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Haversine formula — real distance in meters between two GPS points
const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const R    = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Real compass bearing from point A to point B (0-360 degrees)
const computeBearing = (fromLat, fromLng, toLat, toLng) => {
  const toRad = d => d * Math.PI / 180
  const dLng  = toRad(toLng - fromLng)
  const lat1  = toRad(fromLat)
  const lat2  = toRad(toLat)
  const x     = Math.sin(dLng) * Math.cos(lat2)
  const y     = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360
}

// How many degrees to rotate to face route — negative=left, positive=right
const getHeadingDiff = (deviceHeading, routeBearing) => {
  let diff = routeBearing - deviceHeading
  if (diff >  180) diff -= 360
  if (diff < -180) diff += 360
  return diff
}

// ─── Component ────────────────────────────────────────────────────────────────
const ARNavigation = ({ steps, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [deviceHeading,    setDeviceHeading]     = useState(null)
  const [userLocation,     setUserLocation]      = useState(null)
  const [arrived,          setArrived]           = useState(false)
  const [cameraError,      setCameraError]       = useState(false)
  const [gpsReady,         setGpsReady]          = useState(false)

  const videoRef       = useRef(null)
  const watchIdRef     = useRef(null)
  const currentStepRef = useRef(0) // ref so watchPosition closure always reads latest index

  // Keep ref in sync with state on every render — no useEffect needed
  currentStepRef.current = currentStepIndex

  // ─── Camera ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        console.error('Camera error:', err)
        setCameraError(true)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // ─── Compass / Device Orientation ─────────────────────────────────────────
  useEffect(() => {
    const handleOrientation = (e) => {
      // iOS  → webkitCompassHeading: true north, clockwise, directly usable
      // Android → alpha: counter-clockwise from arbitrary origin, invert to get compass
      const heading = e.webkitCompassHeading !== undefined
        ? e.webkitCompassHeading
        : 360 - e.alpha
      setDeviceHeading(Math.round(heading))
    }

    const addListeners = () => {
      // deviceorientationabsolute = Android Chrome, true geographic North (preferred)
      // deviceorientation = fallback for older / other browsers
      window.addEventListener('deviceorientationabsolute', handleOrientation, true)
      window.addEventListener('deviceorientation',         handleOrientation, true)
    }

    // iOS 13+ silently returns all zeros unless permission granted via user gesture
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(state => { if (state === 'granted') addListeners() })
        .catch(console.error)
    } else {
      addListeners()
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
      window.removeEventListener('deviceorientation',         handleOrientation, true)
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
  // Must read currentStepRef.current (not state) to avoid stale closure
  const checkStepAdvance = useCallback((loc) => {
    if (!steps?.length) return

    const idx  = currentStepRef.current
    const step = steps[idx]
    if (!step) return

    // OSRM maneuver.location = [lng, lat] — note reversed order vs lat/lng
    const stepLng = step.maneuver?.location?.[0]
    const stepLat = step.maneuver?.location?.[1]
    if (stepLat == null || stepLng == null) return

    const dist = getDistanceMeters(loc.lat, loc.lng, stepLat, stepLng)
    console.log(`[AR] Step ${idx + 1}/${steps.length} — ${dist.toFixed(1)}m to waypoint`)

    if (dist < ARRIVAL_THRESHOLD_M) {
      if (idx >= steps.length - 1) {
        setArrived(true)              // last step — reached destination
      } else {
        setCurrentStepIndex(idx + 1) // advance to next turn
      }
    }
  }, [steps])

  // ─── Derived values ───────────────────────────────────────────────────────

  const currentStep = steps?.[currentStepIndex]

  // Compute real bearing from current GPS position to next waypoint
  // This is always accurate — doesn't rely on OSRM's stored bearing_after
  // Falls back to OSRM value only when GPS not acquired yet
  const routeBearing = (() => {
    if (userLocation && currentStep?.maneuver?.location) {
      const [nextLng, nextLat] = currentStep.maneuver.location
      return computeBearing(userLocation.lat, userLocation.lng, nextLat, nextLng)
    }
    return currentStep?.bearing ?? currentStep?.maneuver?.bearing_after ?? 0
  })()

  // Signed difference: how many degrees to rotate to face the route
  const headingDiff = deviceHeading !== null
    ? getHeadingDiff(deviceHeading, routeBearing)
    : null

  // True if phone is pointing within 30° of the required direction
  const isAligned = headingDiff !== null && Math.abs(headingDiff) < ALIGNED_THRESHOLD

  // Human-readable turn instruction from OSRM e.g. "Turn right onto MG Road"
  const instruction = currentStep
    ? getInstructionText(currentStep.maneuver, currentStep.name)
    : 'Loading…'

  // Straight-line distance from user GPS to the next turn waypoint
  const distanceToStep = (() => {
    if (!userLocation || !currentStep?.maneuver?.location) return null
    const [lng, lat] = currentStep.maneuver.location
    return getDistanceMeters(userLocation.lat, userLocation.lng, lat, lng)
  })()

  // Text instruction based on heading difference
  const getHeadingInstruction = () => {
    if (deviceHeading === null) return '📡 Waiting for compass…'
    if (!isAligned) {
      const deg = Math.abs(Math.round(headingDiff))
      return headingDiff > 0
        ? `↩️ Turn right ${deg}°`
        : `↪️ Turn left ${deg}°`
    }
    return '✅ Go straight ahead'
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

      {/* Camera feed — full screen background */}
      {cameraError ? (
        <div className={styles.cameraError}>
          📷 Camera unavailable — running in text-only mode
        </div>
      ) : (
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          playsInline
          muted
        />
      )}

      {/* All UI overlaid on top of camera */}
      <div className={styles.overlay}>

        {/* Top bar — step counter + close */}
        <div className={styles.topBar}>
          <div className={styles.stepPill}>
            Step {currentStepIndex + 1} / {steps?.length ?? 0}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* GPS acquiring banner — shown until first GPS fix */}
        {!gpsReady && (
          <div className={styles.gpsWaiting}>
            📡 Acquiring GPS signal…
          </div>
        )}

        {/* Bottom instruction card */}
        <div className={styles.instructionCard}>

          {/* Distance to next turn — large and prominent */}
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

          {/* OSRM turn instruction */}
          <p className={styles.instruction}>{instruction}</p>

          {/* Heading feedback — green if aligned, red if need to turn */}
          <div className={`${styles.headingFeedback} ${isAligned ? styles.aligned : styles.misaligned}`}>
            {getHeadingInstruction()}
          </div>

          {/* Debug row — remove before production */}
          <div className={styles.debugRow}>
            <span>🧭 device {deviceHeading ?? '…'}°</span>
            <span>🗺 route {Math.round(routeBearing)}°</span>
            <span>📐 diff {headingDiff !== null ? `${Math.round(headingDiff)}°` : '…'}</span>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ARNavigation
