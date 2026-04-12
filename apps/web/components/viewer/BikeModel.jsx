"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";

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
  if (!bikeModelUrl) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <BikeModelContent bikeModelUrl={bikeModelUrl} />
    </Suspense>
  );
}
