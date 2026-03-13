import { useRef } from 'react'

function UTurnArrow() {
  const groupRef = useRef()

  return (
    <group ref={groupRef} position={[0, 1.5, -2]}>
      {/* Vertical shaft going up */}
      <mesh position={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>

      {/* U-turn curve (half torus) */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.08, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>

      {/* Vertical shaft going down */}
      <mesh position={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>

      {/* Arrow head pointing down */}
      <mesh position={[-0.4, -0.65, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>

      {/* Wireframe */}
      <mesh position={[-0.4, -0.65, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.26, 0.51, 16]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>
    </group>
  )
}

export default UTurnArrow
