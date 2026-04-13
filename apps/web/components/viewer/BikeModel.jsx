"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";

function isPlaceholderModelUrl(url) {
  return !url || url.includes("cdn.motoforge.local");
}

function inferBikeStyle(url) {
  const normalized = String(url || "").toLowerCase();

  if (normalized.includes("hayabusa") || normalized.includes("ninja")) {
    return "sport";
  }

  if (normalized.includes("interceptor") || normalized.includes("rninet")) {
    return "retro";
  }

  if (normalized.includes("harley") || normalized.includes("iron883")) {
    return "cruiser";
  }

  return "naked";
}

function WheelAssembly({ x, radius = 0.48, tireWidth = 0.12, rimColor = "#71717a" }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[radius, tireWidth, 24, 56]} />
        <meshStandardMaterial color="#111111" roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[radius - 0.11, 0.04, 18, 40]} />
        <meshStandardMaterial color={rimColor} roughness={0.3} metalness={0.82} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.2, 18]} />
        <meshStandardMaterial color="#27272a" roughness={0.28} metalness={0.78} />
      </mesh>
      <mesh
        position={[0, 0, 0.01]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.17, 0.17, 0.02, 24]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.34} metalness={0.9} />
      </mesh>
    </group>
  );
}

function FrontFork({ style }) {
  const forkAngle = style === "cruiser" ? -0.5 : -0.32;
  const forkLength = style === "cruiser" ? 1.25 : 1.05;

  return (
    <group position={[0.92, 0.6, 0]} rotation={[0, 0, forkAngle]}>
      <mesh position={[0.04, 0.12, 0.17]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, forkLength, 18]} />
        <meshStandardMaterial color="#e4e4e7" roughness={0.24} metalness={0.94} />
      </mesh>
      <mesh position={[0.04, 0.12, -0.17]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, forkLength, 18]} />
        <meshStandardMaterial color="#e4e4e7" roughness={0.24} metalness={0.94} />
      </mesh>
    </group>
  );
}

function EngineBlock({ style }) {
  return (
    <group position={[-0.02, 0.52, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.42, style === "cruiser" ? 0.48 : 0.4]} />
        <meshStandardMaterial color="#18181b" roughness={0.55} metalness={0.32} />
      </mesh>
      <mesh position={[0, -0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.12, 0.28]} />
        <meshStandardMaterial color="#27272a" roughness={0.6} metalness={0.24} />
      </mesh>
    </group>
  );
}

function FuelTank({ style }) {
  if (style === "sport") {
    return (
      <mesh
        position={[0.08, 1.02, 0]}
        rotation={[0, 0, -0.05]}
        castShadow
        receiveShadow
      >
        <capsuleGeometry args={[0.22, 0.52, 8, 18]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.36} />
      </mesh>
    );
  }

  if (style === "retro") {
    return (
      <mesh position={[0.02, 1.02, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.2, 0.44, 8, 18]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.28} metalness={0.34} />
      </mesh>
    );
  }

  if (style === "cruiser") {
    return (
      <mesh
        position={[-0.04, 0.9, 0]}
        rotation={[0, 0, -0.14]}
        castShadow
        receiveShadow
      >
        <capsuleGeometry args={[0.2, 0.62, 8, 18]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.34} metalness={0.32} />
      </mesh>
    );
  }

  return (
    <mesh position={[0.04, 1, 0]} castShadow receiveShadow>
      <capsuleGeometry args={[0.19, 0.48, 8, 18]} />
      <meshStandardMaterial color="#f97316" roughness={0.26} metalness={0.38} />
    </mesh>
  );
}

function SeatAndTail({ style }) {
  if (style === "sport") {
    return (
      <group>
        <mesh
          position={[-0.22, 0.94, 0]}
          rotation={[0, 0, 0.08]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.5, 0.12, 0.34]} />
          <meshStandardMaterial color="#0f172a" roughness={0.62} metalness={0.18} />
        </mesh>
        <mesh
          position={[-0.58, 1.02, 0]}
          rotation={[0, 0, 0.42]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.5, 0.12, 0.26]} />
          <meshStandardMaterial color="#991b1b" roughness={0.34} metalness={0.32} />
        </mesh>
      </group>
    );
  }

  if (style === "retro") {
    return (
      <group>
        <mesh position={[-0.2, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.1, 0.34]} />
          <meshStandardMaterial color="#111827" roughness={0.72} metalness={0.12} />
        </mesh>
        <mesh
          position={[-0.62, 0.9, 0]}
          rotation={[0, 0, 0.18]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.3, 0.08, 0.24]} />
          <meshStandardMaterial color="#a16207" roughness={0.46} metalness={0.2} />
        </mesh>
      </group>
    );
  }

  if (style === "cruiser") {
    return (
      <group>
        <mesh position={[-0.36, 0.84, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.78, 0.12, 0.42]} />
          <meshStandardMaterial color="#18181b" roughness={0.78} metalness={0.14} />
        </mesh>
        <mesh position={[-0.82, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.18, 0.36]} />
          <meshStandardMaterial color="#27272a" roughness={0.74} metalness={0.12} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh
        position={[-0.22, 0.92, 0]}
        rotation={[0, 0, 0.02]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.54, 0.12, 0.34]} />
        <meshStandardMaterial color="#111827" roughness={0.68} metalness={0.16} />
      </mesh>
      <mesh
        position={[-0.56, 0.97, 0]}
        rotation={[0, 0, 0.18]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.34, 0.1, 0.28]} />
        <meshStandardMaterial color="#ea580c" roughness={0.34} metalness={0.28} />
      </mesh>
    </group>
  );
}

function FrontBodywork({ style }) {
  if (style === "sport") {
    return (
      <group>
        <mesh
          position={[0.55, 0.92, 0]}
          rotation={[0, 0, -0.26]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.78, 0.24, 0.48]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.28} metalness={0.34} />
        </mesh>
        <mesh
          position={[0.76, 1.12, 0]}
          rotation={[0, 0, -0.22]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.36, 0.14, 0.28]} />
          <meshStandardMaterial
            color="#cbd5e1"
            roughness={0.08}
            metalness={0.12}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    );
  }

  if (style === "retro") {
    return (
      <group>
        <mesh position={[0.96, 1.02, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.16, 18, 18]} />
          <meshStandardMaterial color="#d4d4d8" roughness={0.26} metalness={0.82} />
        </mesh>
        <mesh
          position={[0.86, 0.98, 0]}
          rotation={[0, 0, -0.08]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.28, 0.12, 0.16]} />
          <meshStandardMaterial color="#27272a" roughness={0.58} metalness={0.2} />
        </mesh>
      </group>
    );
  }

  if (style === "cruiser") {
    return (
      <group>
        <mesh position={[1.04, 1.02, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.18, 18, 18]} />
          <meshStandardMaterial color="#d4d4d8" roughness={0.28} metalness={0.84} />
        </mesh>
        <mesh
          position={[0.5, 1.22, 0]}
          rotation={[0, 0, 0.18]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.98, 0.06, 0.06]} />
          <meshStandardMaterial color="#d4d4d8" roughness={0.24} metalness={0.92} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0.98, 1.04, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#e4e4e7" roughness={0.3} metalness={0.84} />
      </mesh>
      <mesh
        position={[0.58, 1.14, 0]}
        rotation={[0, 0, -0.04]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.86, 0.06, 0.06]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.24} metalness={0.92} />
      </mesh>
    </group>
  );
}

function Exhaust({ style }) {
  const position = style === "cruiser" ? [-0.08, 0.34, -0.26] : [0.74, 0.34, -0.2];
  const rotation = style === "cruiser" ? [0, 0, -0.03] : [0, 0, -0.12];
  const length = style === "cruiser" ? 1.18 : 0.9;

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.08, length, 22]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.22} metalness={0.92} />
      </mesh>
      <mesh
        position={[-0.2, 0.06, 0.06]}
        rotation={[0, 0, 0.36]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.03, 0.03, 0.46, 16]} />
        <meshStandardMaterial color="#71717a" roughness={0.3} metalness={0.84} />
      </mesh>
    </group>
  );
}

function PlaceholderBike({ style }) {
  const frameColor = style === "retro" ? "#92400e" : "#27272a";

  return (
    <group position={[0, -0.46, 0]}>
      <mesh
        position={[0, -0.34, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.82, 40]} />
        <meshStandardMaterial color="#050505" transparent opacity={0.45} />
      </mesh>

      <WheelAssembly x={-1.1} rimColor="#a1a1aa" />
      <WheelAssembly x={1.02} rimColor="#a1a1aa" />

      <mesh
        position={[-0.02, 0.76, 0]}
        rotation={[0, 0, -0.08]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.58, 0.1, 0.12]} />
        <meshStandardMaterial color={frameColor} roughness={0.46} metalness={0.62} />
      </mesh>
      <mesh
        position={[0.16, 0.58, 0]}
        rotation={[0, 0, 0.58]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.92, 0.08, 0.1]} />
        <meshStandardMaterial color={frameColor} roughness={0.46} metalness={0.62} />
      </mesh>
      <mesh
        position={[-0.28, 0.54, 0]}
        rotation={[0, 0, -0.52]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.96, 0.08, 0.1]} />
        <meshStandardMaterial color={frameColor} roughness={0.46} metalness={0.62} />
      </mesh>
      <mesh
        position={[-0.24, 0.3, 0]}
        rotation={[0, 0, -0.18]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.22, 0.08, 0.08]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.52} metalness={0.72} />
      </mesh>

      <FrontFork style={style} />
      <EngineBlock style={style} />
      <FuelTank style={style} />
      <SeatAndTail style={style} />
      <FrontBodywork style={style} />
      <Exhaust style={style} />

      <mesh position={[0.02, 1.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.06, 0.22]} />
        <meshStandardMaterial color="#111827" roughness={0.54} metalness={0.26} />
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
    return <PlaceholderBike style={inferBikeStyle(bikeModelUrl)} />;
  }

  return (
    <Suspense fallback={null}>
      <BikeModelContent bikeModelUrl={bikeModelUrl} />
    </Suspense>
  );
}
