"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";

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
  if (!modelUrl) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ModOverlayContent modelUrl={modelUrl} />
    </Suspense>
  );
}
