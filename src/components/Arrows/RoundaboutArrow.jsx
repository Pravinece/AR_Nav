import { useRef } from 'react'

function RoundaboutArrow() {
  const groupRef = useRef()

  return (
    <group ref={groupRef} position={[0, 1.5, -2]}>
      {/* Central circle (roundabout) */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.06, 16, 32]} />
        <meshStandardMaterial color="#0088ff" />
      </mesh>

      {/* Entering shaft from bottom */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color="#0088ff" />
      </mesh>

      {/* Exiting shaft to right */}
      <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color="#0088ff" />
      </mesh>

      {/* Arrow head */}
      <mesh position={[0.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#0088ff" />
      </mesh>

      {/* Wireframe */}
      <mesh position={[0.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.26, 0.51, 16]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>
    </group>
  )
}

export default RoundaboutArrow
