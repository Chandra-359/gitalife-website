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
 * This is what the user sees on first load and when they click "Overview".
 * Centered over the Hudson River to capture both Manhattan and Jersey City.
 *
 * TODO: Adjust these coordinates if your programs are in a different area.
 */
const HOME_VIEW = {
  center: [-74.02, 40.72] as [number, number],  // [lng, lat] — Hudson River
  zoom: 14.5,                                    // city-level zoom
  pitch: 60,                                     // degrees of tilt for 3D
  bearing: -17.6,                                // slight rotation for drama
};

/* ------------------------------------------------------------------ */
/*  MAP BOUNDS — locks panning to the NYC / JC area                    */
/*                                                                     */
/*  Users cannot scroll beyond this bounding box.                      */
/*  SW = southwest corner, NE = northeast corner.                      */
/*                                                                     */
/*  Coverage:                                                          */
/*    West  → western Jersey City (incl. Newport, Journal Square)      */
/*    East  → eastern Brooklyn / Queens border                         */
/*    South → southern Brooklyn (Bay Ridge area)                       */
/*    North → upper Manhattan (Washington Heights / Inwood)            */
/*                                                                     */
/*  TODO: Widen these if you add programs outside this area.           */
/* ------------------------------------------------------------------ */
const MAP_BOUNDS: [number, number, number, number] = [
  -74.12, 40.57,  // SW corner [lng, lat]
  -73.88, 40.85,  // NE corner [lng, lat]
];

const MIN_ZOOM = 10.5;  // prevents zooming out far enough to see bound edges
const MAX_ZOOM = 18;    // close enough for 3D buildings, not so close textures break

/* ------------------------------------------------------------------ */
/*  3D BUILDING LAYER                                                  */
/*                                                                     */
/*  Extrudes buildings from Mapbox's built-in "building" source-layer. */
/*  Colors interpolate based on building height for visual depth.       */
/*                                                                     */
/*  Color stops (tweak to match your brand):                           */
/*    0m   → #1a1a2e (deep navy)                                       */
/*    50m  → #16213e                                                   */
/*    100m → #0f3460                                                   */
/*    200m → #533483 (purple)                                          */
/*    300m → #e94560 (crimson — tallest towers)                        */
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
      0,   "#1a1a2e",
      50,  "#16213e",
      100, "#0f3460",
      200, "#533483",
      300, "#e94560",
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
    "fill-extrusion-opacity": 0.85,
  },
  filter: ["==", "extrude", "true"],
};

/* ------------------------------------------------------------------ */
/*  SKY LAYER — atmospheric gradient for depth                         */
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
/*  FOG — cinematic depth-of-field haze                                */
/*                                                                     */
/*  "star-intensity" adds subtle stars to the sky when pitched high.    */
/*  Set to 0 to remove stars.                                          */
/* ------------------------------------------------------------------ */
const FOG_CONFIG = {
  range: [1, 12],
  color: "#0a0a1a",
  "high-color": "#1a0a2e",
  "horizon-blend": 0.1,
  "star-intensity": 0.15,
};

/* ------------------------------------------------------------------ */
/*  CINEMATIC FLY-TO SETTINGS                                          */
/*                                                                     */
/*  These control how the camera moves when a marker is clicked.       */
/*  duration is in ms; curve controls the parabolic zoom arc.          */
/* ------------------------------------------------------------------ */
const FLY_TO_ZOOM = 15.8;
const FLY_TO_PITCH = 65;
const FLY_TO_DURATION = 2500;

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

      {/* ============================================================ */}
      {/*  LOADING OVERLAY (z-10)                                      */}
      {/*  Dark screen that fades out once map tiles are loaded.        */}
      {/*  pointer-events-none so it never blocks clicks after fade.    */}
      {/* ============================================================ */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-[#0a0a1a] transition-opacity duration-1000 ${
          mapLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

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
      {/*  MAPBOX GL MAP (z-0 base layer)                              */}
      {/*                                                              */}
      {/*  Map style: mapbox://styles/mapbox/dark-v11                  */}
      {/*  TODO: For a fully custom look, create your own style at     */}
      {/*        https://studio.mapbox.com and paste the URL here.     */}
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
