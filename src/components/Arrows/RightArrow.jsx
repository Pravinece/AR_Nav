import { useRef } from 'react'

function RightArrow() {
  const groupRef = useRef()

  return (
    <group ref={groupRef} position={[0, 1.5, -2]}>
      {/* Vertical shaft */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Horizontal shaft pointing right */}
      <mesh position={[0.4, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Arrow head pointing right */}
      <mesh position={[0.9, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Wireframe outline */}
      <mesh position={[0.9, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.26, 0.51, 16]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>
    </group>
  )
}

export default RightArrow
