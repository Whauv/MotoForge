"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";

function isPlaceholderModelUrl(url) {
  return !url || url.includes("cdn.motoforge.local");
}

function resolveCategory(modelUrl, category) {
  if (category) {
    return category;
  }

  const normalized = String(modelUrl || "").toLowerCase();
  if (normalized.includes("shock") || normalized.includes("suspension")) {
    return "suspension";
  }
  if (normalized.includes("wheel")) {
    return "wheels";
  }
  if (
    normalized.includes("fairing")
    || normalized.includes("screen")
    || normalized.includes("cowl")
  ) {
    return "fairings";
  }
  if (
    normalized.includes("handlebar")
    || normalized.includes("bar")
    || normalized.includes("clipon")
  ) {
    return "handlebars";
  }
  return "exhaust";
}

function PlaceholderMod({ category }) {
  const [{ opacity }] = useSpring(() => ({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 320 },
  }));

  if (category === "exhaust") {
    return (
      <a.group scale={opacity.to((value) => 0.9 + value * 0.1)}>
        <mesh
          position={[0.8, 0.36, -0.24]}
          rotation={[0, 0, -0.16]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.07, 0.11, 0.88, 22]} />
          <meshStandardMaterial
            color="#d4d4d8"
            metalness={0.94}
            roughness={0.2}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh
          position={[0.5, 0.42, -0.1]}
          rotation={[0, 0, 0.38]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.025, 0.025, 0.54, 16]} />
          <meshStandardMaterial
            color="#71717a"
            metalness={0.84}
            roughness={0.26}
            transparent
            opacity={0.9}
          />
        </mesh>
      </a.group>
    );
  }

  if (category === "suspension") {
    return (
      <a.group scale={opacity.to((value) => 0.92 + value * 0.08)}>
        <mesh
          position={[-0.2, 0.5, 0.16]}
          rotation={[0, 0, 0.22]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.045, 0.045, 0.56, 18]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.34}
            roughness={0.34}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh
          position={[-0.2, 0.5, 0.16]}
          rotation={[0, 0, 0.22]}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[0.08, 0.018, 12, 24]} />
          <meshStandardMaterial
            color="#60a5fa"
            metalness={0.24}
            roughness={0.38}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh
          position={[0.92, 0.72, 0.17]}
          rotation={[0, 0, -0.3]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.025, 0.025, 0.86, 16]} />
          <meshStandardMaterial
            color="#bfdbfe"
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh
          position={[0.92, 0.72, -0.17]}
          rotation={[0, 0, -0.3]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.025, 0.025, 0.86, 16]} />
          <meshStandardMaterial
            color="#bfdbfe"
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
      </a.group>
    );
  }

  if (category === "wheels") {
    return (
      <a.group scale={opacity.to((value) => 0.96 + value * 0.04)}>
        {[-1.1, 1.02].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <torusGeometry args={[0.48, 0.06, 18, 42]} />
              <meshStandardMaterial
                color="#4ade80"
                metalness={0.42}
                roughness={0.34}
                transparent
                opacity={0.78}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <torusGeometry args={[0.36, 0.025, 16, 32]} />
              <meshStandardMaterial
                color="#86efac"
                metalness={0.72}
                roughness={0.2}
                transparent
                opacity={0.82}
              />
            </mesh>
          </group>
        ))}
      </a.group>
    );
  }

  if (category === "fairings") {
    return (
      <a.group scale={opacity.to((value) => 0.94 + value * 0.06)}>
        <mesh
          position={[0.56, 0.92, 0]}
          rotation={[0, 0, -0.22]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.82, 0.2, 0.5]} />
          <meshStandardMaterial
            color="#a855f7"
            metalness={0.32}
            roughness={0.38}
            transparent
            opacity={0.74}
          />
        </mesh>
        <mesh
          position={[0.76, 1.12, 0]}
          rotation={[0, 0, -0.2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.32, 0.13, 0.26]} />
          <meshStandardMaterial
            color="#e9d5ff"
            metalness={0.08}
            roughness={0.16}
            transparent
            opacity={0.3}
          />
        </mesh>
      </a.group>
    );
  }

  if (category === "handlebars") {
    return (
      <a.group scale={opacity.to((value) => 0.92 + value * 0.08)}>
        <mesh
          position={[0.52, 1.18, 0]}
          rotation={[0, 0, -0.04]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.94, 0.05, 0.05]} />
          <meshStandardMaterial
            color="#fde047"
            metalness={0.72}
            roughness={0.24}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh
          position={[0.86, 1.1, 0.26]}
          rotation={[0.3, 0, -0.4]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.18, 16]} />
          <meshStandardMaterial
            color="#fef08a"
            metalness={0.5}
            roughness={0.26}
            transparent
            opacity={0.86}
          />
        </mesh>
        <mesh
          position={[0.86, 1.1, -0.26]}
          rotation={[-0.3, 0, 0.4]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.18, 16]} />
          <meshStandardMaterial
            color="#fef08a"
            metalness={0.5}
            roughness={0.26}
            transparent
            opacity={0.86}
          />
        </mesh>
      </a.group>
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

export default function ModOverlay({ modelUrl, category }) {
  if (isPlaceholderModelUrl(modelUrl)) {
    return <PlaceholderMod category={resolveCategory(modelUrl, category)} />;
  }

  return (
    <Suspense fallback={null}>
      <ModOverlayContent modelUrl={modelUrl} />
    </Suspense>
  );
}
