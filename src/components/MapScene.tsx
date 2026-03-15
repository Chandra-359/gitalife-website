"use client";

import { useCallback, useRef, useState } from "react";
import Map, { Layer, Source } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { LayerSpecification } from "mapbox-gl";
import { AnimatePresence } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";

import { PROGRAMS } from "@/data/programs";
import type { Program } from "@/data/programs";
import ProgramMarker from "@/components/ProgramMarker";
import ProgramPanel from "@/components/ProgramPanel";
import ResetViewButton from "@/components/ResetViewButton";

/* ------------------------------------------------------------------ */
/*  Mapbox access token                                                */
/* ------------------------------------------------------------------ */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/* ------------------------------------------------------------------ */
/*  Home camera — the wide establishing shot                           */
/* ------------------------------------------------------------------ */
const HOME_VIEW = {
  center: [-74.02, 40.72] as [number, number],
  zoom: 14.5,
  pitch: 60,
  bearing: -17.6,
};

/* ------------------------------------------------------------------ */
/*  3D building layer                                                  */
/* ------------------------------------------------------------------ */
const BUILDING_3D_LAYER: LayerSpecification = {
  id: "3d-buildings",
  source: "composite",
  "source-layer": "building",
  type: "fill-extrusion",
  minzoom: 12,
  paint: {
    "fill-extrusion-color": [
      "interpolate",
      ["linear"],
      ["get", "height"],
      0,
      "#1a1a2e",
      50,
      "#16213e",
      100,
      "#0f3460",
      200,
      "#533483",
      300,
      "#e94560",
    ],
    "fill-extrusion-height": [
      "interpolate",
      ["linear"],
      ["zoom"],
      12,
      0,
      12.5,
      ["get", "height"],
    ],
    "fill-extrusion-base": [
      "interpolate",
      ["linear"],
      ["zoom"],
      12,
      0,
      12.5,
      ["get", "min_height"],
    ],
    "fill-extrusion-opacity": 0.85,
  },
  filter: ["==", "extrude", "true"],
};

/* ------------------------------------------------------------------ */
/*  Sky layer                                                          */
/* ------------------------------------------------------------------ */
const SKY_LAYER: LayerSpecification = {
  id: "sky",
  type: "sky",
  paint: {
    "sky-type": "atmosphere",
    "sky-atmosphere-sun": [0.0, 90.0],
    "sky-atmosphere-sun-intensity": 15,
  },
};

/* ------------------------------------------------------------------ */
/*  Fog                                                                */
/* ------------------------------------------------------------------ */
const FOG_CONFIG = {
  range: [1, 12],
  color: "#0a0a1a",
  "high-color": "#1a0a2e",
  "horizon-blend": 0.1,
  "star-intensity": 0.15,
};

/* ------------------------------------------------------------------ */
/*  Cinematic fly-to settings                                          */
/* ------------------------------------------------------------------ */
const FLY_TO_ZOOM = 15.8;
const FLY_TO_PITCH = 65;
const FLY_TO_DURATION = 2500;

/**
 * Compute a bearing that makes the camera "orbit in" from the direction
 * of approach. The bearing shifts based on where the target sits
 * relative to the current map center, giving each fly-to a unique
 * drone-like sweep angle.
 */
function computeApproachBearing(
  mapRef: React.RefObject<MapRef | null>,
  targetLng: number,
  targetLat: number,
): number {
  const map = mapRef.current?.getMap();
  if (!map) return -20;

  const center = map.getCenter();
  const dLng = targetLng - center.lng;
  const dLat = targetLat - center.lat;

  // Angle from current center to target (degrees, 0 = north, CW positive)
  const angleDeg = (Math.atan2(dLng, dLat) * 180) / Math.PI;

  // Offset the bearing so the camera sweeps in from the side
  return angleDeg + 30;
}

export default function MapScene() {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isFlying, setIsFlying] = useState(false);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.setFog(FOG_CONFIG as Parameters<typeof map.setFog>[0]);
    setMapLoaded(true);
  }, []);

  /* ---- Cinematic fly-to when a marker is clicked ---- */
  const handleSelectProgram = useCallback(
    (program: Program) => {
      const deselecting = selectedProgram?.id === program.id;

      if (deselecting) {
        setSelectedProgram(null);
        return;
      }

      setSelectedProgram(program);
      setIsFlying(true);

      const bearing = computeApproachBearing(
        mapRef,
        program.longitude,
        program.latitude,
      );

      mapRef.current?.flyTo({
        center: [program.longitude, program.latitude],
        zoom: FLY_TO_ZOOM,
        pitch: FLY_TO_PITCH,
        bearing,
        duration: FLY_TO_DURATION,
        essential: true,
        curve: 1.42,         // controls the zoom arc — higher = more dramatic
        speed: 0.9,          // relative to duration — slightly under 1 for smoothness
      });

      // Clear flying flag after the transition completes
      setTimeout(() => setIsFlying(false), FLY_TO_DURATION + 100);
    },
    [selectedProgram],
  );

  /* ---- Click on empty map → deselect ---- */
  const handleMapClick = useCallback(() => {
    if (!isFlying) {
      setSelectedProgram(null);
    }
  }, [isFlying]);

  /* ---- Reset View — fly back to the wide establishing shot ---- */
  const handleResetView = useCallback(() => {
    setSelectedProgram(null);
    setIsFlying(true);

    mapRef.current?.flyTo({
      ...HOME_VIEW,
      duration: 2800,
      essential: true,
      curve: 1.6,
      speed: 0.8,
    });

    setTimeout(() => setIsFlying(false), 2900);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a1a] text-white">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold">Mapbox Token Required</h1>
          <p className="text-gray-400">
            Set{" "}
            <code className="rounded bg-white/10 px-2 py-1">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            in your{" "}
            <code className="rounded bg-white/10 px-2 py-1">.env.local</code>{" "}
            file to load the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Loading overlay */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-[#0a0a1a] transition-opacity duration-1000 ${
          mapLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Reset View button — top-left overlay */}
      <ResetViewButton
        visible={mapLoaded && selectedProgram !== null}
        onClick={handleResetView}
      />

      {/* Program detail panel — slides in from right */}
      <AnimatePresence mode="wait">
        {selectedProgram && (
          <ProgramPanel
            key={selectedProgram.id}
            program={selectedProgram}
            onClose={handleResetView}
          />
        )}
      </AnimatePresence>

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: HOME_VIEW.center[0],
          latitude: HOME_VIEW.center[1],
          zoom: HOME_VIEW.zoom,
          pitch: HOME_VIEW.pitch,
          bearing: HOME_VIEW.bearing,
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: "100%", height: "100%" }}
        maxPitch={85}
        antialias
        projection={{ name: "globe" }}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
      >
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        <Layer {...BUILDING_3D_LAYER} />
        <Layer {...SKY_LAYER} />

        {PROGRAMS.map((program) => (
          <ProgramMarker
            key={program.id}
            program={program}
            isSelected={selectedProgram?.id === program.id}
            onSelect={handleSelectProgram}
          />
        ))}
      </Map>
    </div>
  );
}
