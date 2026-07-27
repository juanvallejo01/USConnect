"use client"

import { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

interface CoreGeometryProps {
  scrollProgress: React.RefObject<number>
  isDark: boolean
}

export function CoreGeometry({ scrollProgress, isDark }: CoreGeometryProps) {
  const mainRef = useRef<THREE.Mesh>(null!)
  const wireRef = useRef<THREE.LineSegments>(null!)
  const nodesGroupRef = useRef<THREE.Group>(null!)
  const { viewport } = useThree()
  const isMobile = viewport.width < 6

  // Create node positions for the "network" state
  const nodeData = useMemo(() => {
    const nodeCount = isMobile ? 6 : 12
    const nodes: THREE.Vector3[] = []
    const radius = isMobile ? 1.5 : 2.2

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount)
      const theta = Math.sqrt(nodeCount * Math.PI) * phi
      nodes.push(
        new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        )
      )
    }
    return nodes
  }, [isMobile])

  // Create connection lines between nearby nodes
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions: number[] = []

    for (let i = 0; i < nodeData.length; i++) {
      for (let j = i + 1; j < nodeData.length; j++) {
        if (nodeData[i].distanceTo(nodeData[j]) < 3.0) {
          positions.push(nodeData[i].x, nodeData[i].y, nodeData[i].z)
          positions.push(nodeData[j].x, nodeData[j].y, nodeData[j].z)
        }
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [nodeData])

  // Colors for light and dark mode
  const emissiveColor = isDark ? "#2563eb" : "#1d4ed8"
  const wireColor = isDark ? "#60a5fa" : "#3b82f6"
  const nodeColor = isDark ? "#93c5fd" : "#2563eb"
  const lineColor = isDark ? "#3b82f6" : "#93c5fd"

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const scroll = scrollProgress.current ?? 0

    if (mainRef.current) {
      // Slow rotation
      mainRef.current.rotation.y = time * 0.15 + scroll * Math.PI * 0.5
      mainRef.current.rotation.x = Math.sin(time * 0.1) * 0.2 + scroll * 0.3
      mainRef.current.rotation.z = Math.cos(time * 0.08) * 0.1

      // Scale: pulsate in hero, grow slightly with scroll
      const basePulse = 1 + Math.sin(time * 0.5) * 0.03
      const scrollScale = 1 + scroll * 0.15
      const targetScale = basePulse * scrollScale * (isMobile ? 0.7 : 1)
      mainRef.current.scale.setScalar(
        THREE.MathUtils.lerp(mainRef.current.scale.x, targetScale, 0.05)
      )

      // Emissive intensity increases with scroll
      const mat = mainRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        0.3 + scroll * 0.7,
        0.05
      )

      // Opacity: core icosahedron fades slightly as nodes appear
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        scroll > 0.3 ? 0.4 : 0.8,
        0.03
      )
    }

    // Wire frame
    if (wireRef.current) {
      wireRef.current.rotation.copy(mainRef.current.rotation)
      wireRef.current.scale.copy(mainRef.current.scale)
      const wireMat = wireRef.current.material as THREE.LineBasicMaterial
      wireMat.opacity = THREE.MathUtils.lerp(
        wireMat.opacity,
        0.15 + scroll * 0.2,
        0.05
      )
    }

    // Network nodes — appear after 25% scroll
    if (nodesGroupRef.current) {
      nodesGroupRef.current.rotation.y = time * 0.08 + scroll * Math.PI * 0.3
      nodesGroupRef.current.rotation.x = Math.sin(time * 0.06) * 0.15

      const nodeVisibility = Math.max(0, (scroll - 0.2) / 0.3)
      nodesGroupRef.current.children.forEach((child, i) => {
        const target = nodeData[i]
        if (target) {
          child.position.lerp(
            target.clone().multiplyScalar(nodeVisibility),
            0.05
          )
          child.scale.setScalar(
            THREE.MathUtils.lerp(child.scale.x, nodeVisibility * 0.12, 0.05)
          )
        }
      })

      // Connection lines opacity
      const lineMesh = nodesGroupRef.current.children[nodeData.length]
      if (lineMesh) {
        const lineMat = lineMesh.material as THREE.LineBasicMaterial
        if (lineMat) {
          lineMat.opacity = THREE.MathUtils.lerp(lineMat.opacity, nodeVisibility * 0.4, 0.05)
        }
      }
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Main icosahedron — translucent with emissive glow */}
      <mesh ref={mainRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color={isDark ? "#0f172a" : "#e0e7ff"}
          emissive={emissiveColor}
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
          wireframe={false}
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Wireframe overlay */}
      <lineSegments ref={wireRef}>
        <icosahedronGeometry args={[1.25, 1]} />
        <lineBasicMaterial
          color={wireColor}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </lineSegments>

      {/* Network nodes and connections */}
      <group ref={nodesGroupRef}>
        {nodeData.map((_, i) => (
          <mesh key={i} position={[0, 0, 0]} scale={0}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial
              color={nodeColor}
              emissive={nodeColor}
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
        {/* Connection lines */}
        <lineSegments geometry={lineGeometry}>
          <lineBasicMaterial
            color={lineColor}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      </group>
    </group>
  )
}
