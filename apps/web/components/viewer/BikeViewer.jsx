"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls } from "@react-three/drei";
import { useReducedMotion } from "motion/react";

import BikeModel from "./BikeModel";
import ModOverlay from "./ModOverlay";
import ViewerErrorBoundary from "./ViewerErrorBoundary";
import { isPlaceholderModelUrl } from "./placeholder/PlaceholderBike";
import { toTitleCase } from "../../lib/formatters";

// Where each part area sits on the procedural placeholder bike. Real GLB
// assets would ship their own anchor points.
const HOTSPOT_POSITIONS = {
  exhaust: [0.78, -0.08, 0.05],
  suspension: [-0.22, 0.12, 0.22],
  wheels: [-1.1, -0.46, 0.22],
  fairings: [0.62, 0.52, 0.26],
  handlebars: [0.52, 0.8, 0.22],
};

function ViewerFallback() {
  return (
    <Html center>
      <div className="w-64 rounded-panel bg-bench-raised p-4 text-center text-sm shadow-md">
        <p className="font-semibold">This 3D model didn&apos;t load</p>
        <p className="mt-1 text-graphite-soft">
          Check that the GLB file exists at the bike&apos;s model URL. Parts and pricing still work.
        </p>
      </div>
    </Html>
  );
}

function Hotspot({ category, position, active, fitted, onSelect }) {
  return (
    <Html position={position} center zIndexRange={[20, 0]}>
      <button
        type="button"
        onClick={() => onSelect(category)}
        aria-pressed={active}
        className={`group flex items-center gap-2 whitespace-nowrap rounded-full py-1 pl-1 pr-3 text-xs font-semibold shadow-sm ring-1 transition-colors ${
          active
            ? "bg-anodized text-white ring-anodized"
            : "bg-bench-raised/90 text-graphite ring-steel/60 hover:ring-anodized"
        }`}
      >
        <span
          aria-hidden
          className={`h-4 w-4 rounded-full border-2 ${
            active ? "border-white bg-anodized" : fitted ? "border-anodized bg-anodized" : "border-graphite-soft bg-bench-raised"
          }`}
        />
        {toTitleCase(category)}
      </button>
    </Html>
  );
}

export default function BikeViewer({
  bikeModelUrl,
  selectedMods = [],
  hotspots = [],
  activeCategory = null,
  onHotspotSelect,
  className = "h-[56vh] min-h-[340px]",
}) {
  const reduceMotion = useReducedMotion();
  const [autoRotate, setAutoRotate] = useState(true);
  const showHotspots = Boolean(onHotspotSelect) && isPlaceholderModelUrl(bikeModelUrl);

  const visibleMods = useMemo(() => selectedMods.filter((mod) => mod?.model_url), [selectedMods]);
  const resetKey = `${bikeModelUrl || ""}:${visibleMods.map((mod) => mod.model_url).join("|")}`;

  return (
    <div className={`relative w-full ${className}`}>
      <Canvas camera={{ position: [0.4, 1.1, 4.6], fov: 42 }} gl={{ antialias: true }} dpr={[1, 2]}>
        <color attach="background" args={["#e4e5e2"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 8, 6]} intensity={1.4} />
        <ViewerErrorBoundary resetKey={resetKey} fallback={<ViewerFallback />}>
          <Suspense fallback={null}>
            <Environment preset="warehouse" />
            {bikeModelUrl ? <BikeModel bikeModelUrl={bikeModelUrl} /> : null}
            {visibleMods.map((mod) => (
              <ModOverlay key={mod.model_url} modelUrl={mod.model_url} category={mod.category} />
            ))}
          </Suspense>
        </ViewerErrorBoundary>
        <ContactShadows position={[0, -0.94, 0]} opacity={0.35} scale={6} blur={2.4} far={2} />
        {showHotspots
          ? hotspots.map((hotspot) => (
              <Hotspot
                key={hotspot.category}
                category={hotspot.category}
                position={HOTSPOT_POSITIONS[hotspot.category] || [0, 0, 0]}
                active={activeCategory === hotspot.category}
                fitted={hotspot.fitted}
                onSelect={onHotspotSelect}
              />
            ))
          : null}
        <OrbitControls
          enablePan={false}
          minDistance={2.6}
          maxDistance={8}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.95}
          autoRotate={autoRotate && !reduceMotion}
          autoRotateSpeed={0.35}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-graphite-soft">
        Drag to turn the bike. Scroll or pinch to zoom.
      </p>
    </div>
  );
}
