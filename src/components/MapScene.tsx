"use client";

/**
 * MapScene — Full-screen 3D Mapbox map with program markers & UI overlays
 *
 * This is the root client component that orchestrates the entire map experience.
 * It renders the Mapbox GL map, program markers, detail panel, navbar, and
 * the reset-view button.
 *
 * Z-INDEX HIERARCHY (reviewed & intentional):
 * ├── z-0  — Mapbox GL canvas (base layer)
 * │   └── Markers live inside the map container; Mapbox manages their stacking
 * ├── z-10 — Loading overlay (fades to opacity-0 after load, then non-interactive)
 * ├── z-20 — Mapbox attribution / logo (styled in globals.css)
 * ├── z-30 — ResetViewButton & ProgramPanel (UI overlays above map)
 * └── z-40 — Navbar (always on top, never obscured)
 *
 * CUSTOMIZATION GUIDE:
 * ├── Map center / zoom ......... edit HOME_VIEW below
 * ├── Map style ................. change the mapStyle prop on <Map>
 * ├── Building colors ........... edit BUILDING_3D_LAYER paint stops
 * ├── Fog / atmosphere .......... edit FOG_CONFIG
 * ├── Fly-to feel ............... tweak FLY_TO_ZOOM, FLY_TO_PITCH, FLY_TO_DURATION
 * └── Markers ................... edit src/data/programs.ts
 */

import { useCallback, useRef, useState } from "react";
import Map, { Layer, Source } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { LayerSpecification } from "mapbox-gl";
import { AnimatePresence } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";

import type { Program } from "@/data/programs";
import Navbar from "@/components/Navbar";
import ProgramMarker from "@/components/ProgramMarker";
import ProgramPanel from "@/components/ProgramPanel";
import ResetViewButton from "@/components/ResetViewButton";

/* ================================================================== */
/*  CONFIGURATION — Edit these to change the map's look & feel         */
/* ================================================================== */

/**
 * Mapbox access token — loaded from .env.local
 * Get yours at https://account.mapbox.com/access-tokens/
 */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/**
 * HOME_VIEW — The default "establishing shot" camera position.
 *
 * Centered over the Hudson River to capture both Manhattan and Jersey City.
 * The high pitch + dramatic bearing creates a cinematic "drone reveal" feel.
 */
const HOME_VIEW = {
  center: [-74.02, 40.72] as [number, number],  // [lng, lat] — Hudson River
  zoom: 13.2,                                    // slightly wider to show more skyline
  pitch: 62,                                     // steep tilt for dramatic 3D depth
  bearing: -25,                                  // angled for golden light direction
};

/* ------------------------------------------------------------------ */
/*  MAP BOUNDS — locks panning to New Jersey + New York                */
/*                                                                     */
/*  Users cannot scroll beyond this bounding box.                      */
/*  SW = southwest corner, NE = northeast corner.                      */
/*                                                                     */
/*  Coverage:                                                          */
/*    West  → western NJ border (Delaware River)                       */
/*    East  → Long Island / CT coastline                               */
/*    South → southern NJ (Cape May area)                              */
/*    North → upstate NY (Adirondacks / Lake Champlain)                */
/* ------------------------------------------------------------------ */
const MAP_BOUNDS: [number, number, number, number] = [
  -75.6, 38.9,   // SW corner [lng, lat] — southern NJ
  -71.8, 45.1,   // NE corner [lng, lat] — upstate NY
];

const MIN_ZOOM = 6;     // allows seeing all of NJ + NY at once
const MAX_ZOOM = 18;    // close enough for 3D buildings, not so close textures break

/* ------------------------------------------------------------------ */
/*  3D BUILDING LAYER — Golden Hour Palette                            */
/*                                                                     */
/*  Extrudes buildings from Mapbox's built-in "building" source-layer. */
/*  Colors interpolate based on building height with warm golden tones  */
/*  to match the golden hour atmosphere.                                */
/*                                                                     */
/*  Color stops:                                                       */
/*    0m   → #1a1520 (warm dark base)                                  */
/*    30m  → #2a1a28 (warm shadow)                                     */
/*    80m  → #6b3a2a (copper)                                          */
/*    150m → #c4722a (amber)                                           */
/*    250m → #d4944a (golden)                                          */
/*    350m → #e8a85a (bright gold — tallest towers catch the sun)      */
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
      0,   "#1a1520",
      30,  "#2a1a28",
      80,  "#6b3a2a",
      150, "#c4722a",
      250, "#d4944a",
      350, "#e8a85a",
    ],
    "fill-extrusion-height": [
      "interpolate", ["linear"], ["zoom"],
      12,   0,
      12.5, ["get", "height"],
    ],
    "fill-extrusion-base": [
      "interpolate", ["linear"], ["zoom"],
      12,   0,
      12.5, ["get", "min_height"],
    ],
    "fill-extrusion-opacity": 0.88,
  },
  filter: ["==", "extrude", "true"],
};

/* ------------------------------------------------------------------ */
/*  SKY LAYER — Golden Hour Atmosphere                                 */
/*                                                                     */
/*  Sun positioned low on the horizon (5° elevation) facing west       */
/*  (azimuth 280°) for a dramatic golden hour / sunset look.           */
/*  High sun intensity washes the sky in warm amber and rose tones.    */
/*                                                                     */
/*  sky-atmosphere-color: the ambient sky color (warm peach)            */
/*  sky-atmosphere-halo-color: glow ring around the sun (deep orange)   */
/* ------------------------------------------------------------------ */
const SKY_LAYER: LayerSpecification = {
  id: "sky",
  type: "sky",
  paint: {
    "sky-type": "atmosphere",
    "sky-atmosphere-sun": [280.0, 5.0],
    "sky-atmosphere-sun-intensity": 8,
    "sky-atmosphere-color": "#e8a060",
    "sky-atmosphere-halo-color": "#d4602a",
  },
};

/* ------------------------------------------------------------------ */
/*  FOG — Golden Hour Atmospheric Haze                                 */
/*                                                                     */
/*  Creates the cinematic "golden hour" look with warm amber fog at     */
/*  ground level, transitioning to deep warm tones at the horizon.      */
/*                                                                     */
/*  color: ground-level haze (warm dark amber)                          */
/*  high-color: upper atmosphere color (deep sunset rose/purple)        */
/*  horizon-blend: how much fog blends at the horizon (higher = softer) */
/*  star-intensity: faint stars visible when pitched high               */
/*  space-color: color of the sky above the atmosphere                  */
/* ------------------------------------------------------------------ */
const FOG_CONFIG = {
  range: [0.5, 14],
  color: "#1a1018",
  "high-color": "#4a2040",
  "horizon-blend": 0.08,
  "star-intensity": 0.12,
  "space-color": "#120a18",
};

/* ------------------------------------------------------------------ */
/*  CINEMATIC FLY-TO SETTINGS                                          */
/*                                                                     */
/*  These control how the camera moves when a marker is clicked.       */
/*  duration is in ms; curve controls the parabolic zoom arc.          */
/* ------------------------------------------------------------------ */
const FLY_TO_ZOOM = 15.5;
const FLY_TO_PITCH = 65;
const FLY_TO_DURATION = 2800;

/**
 * Compute a unique approach bearing for each fly-to.
 *
 * Based on the angle from the current map center to the target,
 * offset by 30° so the camera "orbits in" from the side —
 * like a drone sweeping into the neighborhood.
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

  const angleDeg = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  return angleDeg + 30;
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

interface MapSceneProps {
  programs: Program[];
}

export default function MapScene({ programs }: MapSceneProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isFlying, setIsFlying] = useState(false);

  /* ---- Map loaded callback — sets fog, reveals UI ---- */
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.setFog(FOG_CONFIG as Parameters<typeof map.setFog>[0]);
    setMapLoaded(true);
  }, []);

  /* ---- Cinematic fly-to when a marker is clicked ---- */
  const handleSelectProgram = useCallback(
    (program: Program) => {
      // Toggle off if clicking the already-selected marker
      if (selectedProgram?.id === program.id) {
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
        curve: 1.42,
        speed: 0.9,
      });

      setTimeout(() => setIsFlying(false), FLY_TO_DURATION + 100);
    },
    [selectedProgram],
  );

  /* ---- Click on empty map → deselect (ignored mid-flight) ---- */
  const handleMapClick = useCallback(() => {
    if (!isFlying) {
      setSelectedProgram(null);
    }
  }, [isFlying]);

  /* ---- Reset View — fly back to the establishing shot ---- */
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

  /* ---- Missing token fallback ---- */
  if (!MAPBOX_TOKEN) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center text-white"
        style={{ background: "radial-gradient(ellipse at 60% 40%, #1a1018, #0a0810 60%, #060408)" }}
      >
        <div className="max-w-md text-center">
          <div
            className="mx-auto mb-6 h-16 w-16 rounded-full"
            style={{ background: "radial-gradient(circle, #E8751A33 0%, transparent 70%)" }}
          />
          <h1 className="mb-4 text-2xl font-bold">Mapbox Token Required</h1>
          <p className="text-white/50">
            Set{" "}
            <code className="rounded bg-white/10 px-2 py-1 text-[#E8751A]">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            in your{" "}
            <code className="rounded bg-white/10 px-2 py-1 text-[#E8751A]">.env.local</code>{" "}
            file to load the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">

      {/* ============================================================ */}
      {/*  LOADING OVERLAY (z-10)                                      */}
      {/*  Warm gradient screen that fades out once map tiles load.     */}
      {/*  pointer-events-none so it never blocks clicks after fade.    */}
      {/* ============================================================ */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-[1500ms] ${
          mapLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background: "radial-gradient(ellipse at 70% 50%, #1a1018 0%, #0a0810 60%, #060408 100%)",
        }}
      >
        {/* Loading shimmer — warm golden pulse */}
        {!mapLoaded && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <div className="relative h-12 w-12">
              <div
                className="absolute inset-0 animate-ping rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, #E8751A 0%, transparent 70%)" }}
              />
              <div
                className="absolute inset-2 animate-pulse rounded-full"
                style={{ background: "radial-gradient(circle, #D4A843 0%, #E8751A 100%)" }}
              />
            </div>
            <p className="animate-pulse text-xs font-medium uppercase tracking-[0.3em] text-white/30">
              Loading Map
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  NAVBAR (z-40) — always on top                                */}
      {/* ============================================================ */}
      <Navbar />

      {/* ============================================================ */}
      {/*  RESET VIEW BUTTON (z-30)                                    */}
      {/*  Visible only when a program is selected.                    */}
      {/*  Positioned below navbar (top-20) on desktop.                */}
      {/* ============================================================ */}
      <ResetViewButton
        visible={mapLoaded && selectedProgram !== null}
        onClick={handleResetView}
      />

      {/* ============================================================ */}
      {/*  PROGRAM DETAIL PANEL (z-30)                                 */}
      {/*  Desktop: slides in from right, below navbar                 */}
      {/*  Mobile: bottom sheet capped at 40vh                         */}
      {/*  AnimatePresence mode="wait" ensures clean exit→enter         */}
      {/* ============================================================ */}
      <AnimatePresence mode="wait">
        {selectedProgram && (
          <ProgramPanel
            key={selectedProgram.id}
            program={selectedProgram}
            onClose={handleResetView}
          />
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/*  CINEMATIC VIGNETTE (z-[5]) — warm edge darkening             */}
      {/*  Adds a subtle gradient around the edges of the viewport      */}
      {/*  for a filmic, golden-hour feel.                              */}
      {/* ============================================================ */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background: [
            "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(10, 8, 16, 0.4) 100%)",
            "linear-gradient(to top, rgba(10, 8, 16, 0.3) 0%, transparent 30%)",
            "linear-gradient(to bottom, rgba(10, 8, 16, 0.15) 0%, transparent 15%)",
          ].join(", "),
        }}
      />

      {/* ============================================================ */}
      {/*  MAPBOX GL MAP (z-0 base layer)                              */}
      {/*                                                              */}
      {/*  Map style: mapbox://styles/mapbox/dark-v11                  */}
      {/* ============================================================ */}
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
        maxBounds={MAP_BOUNDS}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxPitch={85}
        antialias
        projection={{ name: "globe" }}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
      >
        {/* Terrain DEM source for 3D elevation */}
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        {/* 3D extruded buildings */}
        <Layer {...BUILDING_3D_LAYER} />

        {/* Atmospheric sky */}
        <Layer {...SKY_LAYER} />

        {/* ---- Program markers (rendered inside map for correct geo-positioning) ---- */}
        {programs.map((program) => (
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
