import { useRef } from 'react'

function ArriveArrow() {
  const groupRef = useRef()

  return (
    <group ref={groupRef} position={[0, 1.5, -2]}>
      {/* Target circle (destination) */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.35, 0.08, 16, 32]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>

      {/* Center dot */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
      </mesh>

      {/* Approaching shaft from below */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Arrow head pointing to target */}
      <mesh position={[0, 0.05, 0]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Pulsing outer ring */}
      <mesh position={[0, 0.3, 0]} scale={1.2}>
        <torusGeometry args={[0.35, 0.04, 16, 32]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export default ArriveArrow
