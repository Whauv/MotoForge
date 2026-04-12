"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";

function isPlaceholderModelUrl(url) {
  return !url || url.includes("cdn.motoforge.local");
}

function PlaceholderBike() {
  return (
    <group position={[0, -0.45, 0]}>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.26, 0.72]} />
        <meshStandardMaterial color="#f97316" metalness={0.45} roughness={0.32} />
      </mesh>
      <mesh position={[0.62, 0.96, 0]} rotation={[0, 0, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 0.1, 0.1]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.72} roughness={0.26} />
      </mesh>
      <mesh position={[-0.52, 0.9, 0]} rotation={[0, 0, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.1, 0.1]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.62} roughness={0.34} />
      </mesh>
      <mesh position={[0.08, 1.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.64, 0.16, 0.34]} />
        <meshStandardMaterial color="#27272a" metalness={0.25} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 1.72, 24]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh position={[-1, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.46, 0.12, 18, 36]} />
        <meshStandardMaterial color="#09090b" metalness={0.18} roughness={0.85} />
      </mesh>
      <mesh position={[1, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.46, 0.12, 18, 36]} />
        <meshStandardMaterial color="#09090b" metalness={0.18} roughness={0.85} />
      </mesh>
    </group>
  );
}

function BikeModelContent({ bikeModelUrl }) {
  const { scene } = useGLTF(bikeModelUrl);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return <primitive object={clonedScene} dispose={null} />;
}

export default function BikeModel({ bikeModelUrl }) {
  if (isPlaceholderModelUrl(bikeModelUrl)) {
    return <PlaceholderBike />;
  }

  return (
    <Suspense fallback={null}>
      <BikeModelContent bikeModelUrl={bikeModelUrl} />
    </Suspense>
  );
}
