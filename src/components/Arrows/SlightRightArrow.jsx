import { useRef } from 'react'

function SlightRightArrow() {
  const groupRef = useRef()

  return (
    <group ref={groupRef} position={[0, 1.5, -2]}>
      {/* Main shaft angled slightly right */}
      <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <cylinderGeometry args={[0.08, 0.08, 1.5, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Arrow head */}
      <mesh position={[0.35, 0.75, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Wireframe outline */}
      <mesh position={[0.35, 0.75, 0]} rotation={[0, 0, -Math.PI / 12]}>
        <coneGeometry args={[0.26, 0.51, 16]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>
    </group>
  )
}

export default SlightRightArrow
