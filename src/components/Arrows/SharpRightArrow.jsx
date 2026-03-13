import { useRef } from 'react'

function SharpRightArrow() {
  const groupRef = useRef()

  return (
    <group ref={groupRef} position={[0, 1.5, -2]}>
      {/* Vertical shaft */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
        <meshStandardMaterial color="#ff6600" />
      </mesh>

      {/* Curve connector (torus segment) */}
      <mesh position={[0.3, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.08, 16, 32, Math.PI / 2]} />
        <meshStandardMaterial color="#ff6600" />
      </mesh>

      {/* Horizontal shaft pointing down-right */}
      <mesh position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color="#ff6600" />
      </mesh>

      {/* Arrow head */}
      <mesh position={[0.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.5, 16]} />
        <meshStandardMaterial color="#ff6600" />
      </mesh>

      {/* Wireframe */}
      <mesh position={[0.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.26, 0.51, 16]} />
        <meshBasicMaterial color="white" wireframe />
      </mesh>
    </group>
  )
}

export default SharpRightArrow
