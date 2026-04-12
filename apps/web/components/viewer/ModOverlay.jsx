"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";

function isPlaceholderModelUrl(url) {
  return !url || url.includes("cdn.motoforge.local");
}

function PlaceholderMod({ modelUrl }) {
  const [{ opacity }] = useSpring(() => ({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 300 },
  }));

  if (modelUrl?.includes("exhaust")) {
    return (
      <a.mesh
        position={[0.94, 0.45, -0.22]}
        rotation={[0, 0, -0.18]}
        scale={opacity.to((value) => 0.9 + value * 0.1)}
      >
        <cylinderGeometry args={[0.08, 0.12, 0.86, 18]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.88}
          roughness={0.22}
          opacity={0.92}
          transparent
        />
      </a.mesh>
    );
  }

  if (modelUrl?.includes("shock")) {
    return (
      <a.mesh
        position={[-0.16, 0.42, 0]}
        rotation={[0, 0, 0.14]}
        scale={opacity.to((value) => 0.9 + value * 0.1)}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.62, 18]} />
        <meshStandardMaterial
          color="#38bdf8"
          metalness={0.35}
          roughness={0.4}
          opacity={0.9}
          transparent
        />
      </a.mesh>
    );
  }

  if (modelUrl?.includes("wheels")) {
    return (
      <a.group scale={opacity.to((value) => 0.94 + value * 0.06)}>
        <mesh position={[-1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.06, 18, 36]} />
          <meshStandardMaterial
            color="#4ade80"
            metalness={0.45}
            roughness={0.35}
            opacity={0.9}
            transparent
          />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.06, 18, 36]} />
          <meshStandardMaterial
            color="#4ade80"
            metalness={0.45}
            roughness={0.35}
            opacity={0.9}
            transparent
          />
        </mesh>
      </a.group>
    );
  }

  if (modelUrl?.includes("fairing")) {
    return (
      <a.mesh
        position={[0.22, 0.82, 0]}
        scale={opacity.to((value) => 0.92 + value * 0.08)}
      >
        <boxGeometry args={[1.15, 0.22, 0.52]} />
        <meshStandardMaterial
          color="#a855f7"
          metalness={0.3}
          roughness={0.45}
          opacity={0.82}
          transparent
        />
      </a.mesh>
    );
  }

  if (modelUrl?.includes("rizoma") || modelUrl?.includes("handlebars")) {
    return (
      <a.mesh
        position={[0.58, 1.05, 0]}
        rotation={[0, 0, -0.08]}
        scale={opacity.to((value) => 0.92 + value * 0.08)}
      >
        <boxGeometry args={[1.15, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#fde047"
          metalness={0.55}
          roughness={0.3}
          opacity={0.9}
          transparent
        />
      </a.mesh>
    );
  }

  return null;
}

function ModOverlayContent({ modelUrl }) {
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const [{ opacity }] = useSpring(() => ({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 300 },
  }));

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

          materials.forEach((material) => {
            material.transparent = true;
          });
        }
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    const unsubscribe = opacity.onChange((value) => {
      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

          materials.forEach((material) => {
            material.opacity = value;
          });
        }
      });
    });

    return () => unsubscribe();
  }, [clonedScene, opacity]);

  return (
    <a.group scale={opacity.to((value) => 0.985 + value * 0.015)}>
      <primitive object={clonedScene} dispose={null} />
    </a.group>
  );
}

export default function ModOverlay({ modelUrl }) {
  if (isPlaceholderModelUrl(modelUrl)) {
    return <PlaceholderMod modelUrl={modelUrl} />;
  }

  return (
    <Suspense fallback={null}>
      <ModOverlayContent modelUrl={modelUrl} />
    </Suspense>
  );
}
