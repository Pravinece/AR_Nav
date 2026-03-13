import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function StraightArrow({ deviceHeading, routeBearing }) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current && deviceHeading && routeBearing) {
      const headingRad = (deviceHeading * Math.PI) / 180
      const bearingRad = (routeBearing * Math.PI) / 180
      groupRef.current.rotation.y = -(bearingRad - headingRad)
    }
  })

  return (
    <group ref={groupRef} position={[0, 1, -2]}>
      {/* Arrow Shaft */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.5, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Arrow Head (pointing up) */}
      <mesh position={[0, 0.95, 0]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Wireframe outline */}
      <mesh position={[0, 0.95, 0]}>
        <coneGeometry args={[0.26, 0.51, 16]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>
    </group>
  )
}

export default StraightArrow
