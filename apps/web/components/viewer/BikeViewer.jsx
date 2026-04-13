"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Html, OrbitControls } from "@react-three/drei";

import BikeModel from "./BikeModel";
import ModOverlay from "./ModOverlay";
import ViewerErrorBoundary from "./ViewerErrorBoundary";

function ViewerFallback() {
  return (
    <Html center>
      <div className="max-w-sm rounded-3xl border border-orange-400/30 bg-black/70 px-5 py-4 text-center text-sm text-zinc-200 backdrop-blur-md">
        <p className="font-semibold text-orange-300">3D asset unavailable</p>
        <p className="mt-2 text-xs text-zinc-400">
          The selected model could not load. Check the GLB file path or keep using
          placeholder mode until the asset is ready.
        </p>
      </div>
    </Html>
  );
}

export default function BikeViewer({ bikeModelUrl, selectedMods = [] }) {
  const [autoRotate, setAutoRotate] = useState(true);

  const visibleMods = useMemo(
    () => selectedMods.filter((mod) => mod?.model_url),
    [selectedMods],
  );
  const resetKey = `${bikeModelUrl || ""}:${visibleMods
    .map((mod) => mod.model_url)
    .join("|")}`;

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#111] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow />
        <ViewerErrorBoundary resetKey={resetKey} fallback={<ViewerFallback />}>
          <Suspense fallback={null}>
            <Environment preset="city" />
            {bikeModelUrl ? <BikeModel bikeModelUrl={bikeModelUrl} /> : null}
            {visibleMods.map((mod) => (
              <ModOverlay
                key={mod.model_url}
                modelUrl={mod.model_url}
                category={mod.category}
              />
            ))}
          </Suspense>
        </ViewerErrorBoundary>
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          autoRotate={autoRotate}
          autoRotateSpeed={0.4}
          onStart={() => setAutoRotate(false)}
        />
        <Html position={[-1.9, -1.55, 0]} transform={false}>
          <div className="rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-white/70 backdrop-blur-md">
            Drag to rotate - Scroll to zoom
          </div>
        </Html>
      </Canvas>
    </div>
  );
}
