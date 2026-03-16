import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'

function StraightArrow({ deviceHeading, routeBearing }) {
  const groupRef = useRef()
  const { camera } = useThree()

  useFrame(() => {
    if (groupRef.current) {
      // ─── Make arrow follow camera position ─────────────────────────────
      // Copy camera position but keep arrow at eye level
      groupRef.current.position.x = camera.position.x
      groupRef.current.position.y = camera.position.y
      groupRef.current.position.z = camera.position.z - 2 // 2 meters in front

      // ─── Rotate arrow based on compass heading ─────────────────────────
      if (deviceHeading !== null && routeBearing !== null) {
        const headingRad = (deviceHeading * Math.PI) / 180
        const bearingRad = (routeBearing * Math.PI) / 180
        groupRef.current.rotation.y = -(bearingRad - headingRad)
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Arrow Shaft - HORIZONTAL (rotated 90°) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 1.5, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Arrow Head - pointing FORWARD (not up) */}
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Wireframe outline */}
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.26, 0.51, 16]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>   
    </group>
  )
}

export default StraightArrow