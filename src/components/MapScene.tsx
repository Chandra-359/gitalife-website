"use client";

/**
 * MapScene — Full-screen 3D Mapbox map with program markers & UI overlays
 *
 * This is the root client component that orchestrates the entire map experience.
 * It renders the Mapbox GL map, program markers, detail panel, navbar, and
 * the reset-view button.
 *
 * DESIGN CONCEPTS:
 * ├── "Lamp Glow" — Diya/flame markers cast warm radial light on the dark map
 * ├── "Golden Threads" — Animated connection lines (sūtra) between programs
 * └── Together they create: "Spreading the light of Bhagavad Gita across NYC"
 *
 * Z-INDEX HIERARCHY (reviewed & intentional):
 * ├── z-0  — Mapbox GL canvas (base layer)
 * │   └── Markers live inside the map container; Mapbox manages their stacking
 * ├── z-10 — Loading overlay (fades to opacity-0 after load, then non-interactive)
 * ├── z-20 — Mapbox attribution / logo (styled in globals.css)
 * ├── z-30 — ResetViewButton & ProgramPanel (UI overlays above map)
 * └── z-40 — Navbar (always on top, never obscured)
 */

import { useCallback, useMemo, useRef, useState } from "react";
import Map, { Layer, Source } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { LayerSpecification } from "mapbox-gl";
import { motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";

import type { Program } from "@/data/programs";
import { getCategoryColor } from "@/data/programs";
import Navbar from "@/components/Navbar";
import HeroIntro from "@/components/HeroIntro";
import TempleMarker from "@/components/TempleMarker";
import ProgramMarker from "@/components/ProgramMarker";
import ProgramCarousel from "@/components/ProgramCarousel";
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
 * INTRO_VIEW — Starting camera: high altitude, looking down.
 * This plays behind the HeroIntro overlay so the map is loading tiles in the background.
 */
const INTRO_VIEW = {
  center: [-74.005, 40.72] as [number, number],
  zoom: 10.5,
  pitch: 0,
  bearing: 0,
};

/**
 * ISKCON_TEMPLE — 305 Schermerhorn St, Brooklyn, NY 11217
 * The camera swoops down to this landmark first, giving users
 * a dramatic "arriving at the temple" moment.
 */
const ISKCON_TEMPLE = {
  center: [-73.9817, 40.6867] as [number, number],  // 305 Schermerhorn St
  zoom: 17,          // street-level close-up
  pitch: 72,         // dramatic low angle looking up at the building
  bearing: 40,       // angled approach
};

/**
 * HOME_VIEW — The "establishing shot" after the temple fly-by.
 * Camera pulls back to show all program locations across the city.
 */
const HOME_VIEW = {
  center: [-74.005, 40.72] as [number, number],
  zoom: 13,
  pitch: 58,
  bearing: -17,
};

/* ------------------------------------------------------------------ */
/*  MAP BOUNDS — Tightened to: Jersey City, Newport, Manhattan,        */
/*  and Brooklyn. No more wandering to Queens or the Bronx.            */
/* ------------------------------------------------------------------ */
const MAP_BOUNDS: [number, number, number, number] = [
  -74.08, 40.63,   // SW corner — covers south Brooklyn + west Jersey City
  -73.92, 40.80,   // NE corner — upper Manhattan (Harlem) + east Brooklyn
];

const MIN_ZOOM = 11;   // keeps the four-area view framed nicely
const MAX_ZOOM = 18;

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
      0,   "#1a1520",       // warm dark base
      50,  "#1e1830",       // slight purple warmth
      100, "#2a1a3e",       // deep warm purple
      200, "#5c3a1e",       // warm bronze for mid-rise
      300, "#E8751A",       // saffron crowns on tallest buildings
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
  range: [1, 10],
  color: "#0c0a14",                // slightly warmer dark
  "high-color": "#1a0f1e",         // warm purple-brown horizon
  "horizon-blend": 0.15,
  "star-intensity": 0.2,           // slightly more stars for ambiance
};

/* ------------------------------------------------------------------ */
/*  GOLDEN THREADS — Connection lines between program locations         */
/*                                                                     */
/*  Inspired by "sūtra" (thread of wisdom). Golden animated lines      */
/*  connect all programs, forming a constellation of knowledge.         */
/* ------------------------------------------------------------------ */
const THREAD_LINE_LAYER: LayerSpecification = {
  id: "golden-threads",
  type: "line",
  source: "threads",
  paint: {
    "line-color": "#D4A843",
    "line-width": [
      "interpolate", ["linear"], ["zoom"],
      11, 0.8,
      15, 1.6,
    ],
    "line-opacity": 0.3,
    "line-dasharray": [2, 4],
  },
};

const THREAD_GLOW_LAYER: LayerSpecification = {
  id: "golden-threads-glow",
  type: "line",
  source: "threads",
  paint: {
    "line-color": "#E8751A",
    "line-width": [
      "interpolate", ["linear"], ["zoom"],
      11, 3,
      15, 6,
    ],
    "line-opacity": 0.08,
    "line-blur": 6,
  },
};

/* ------------------------------------------------------------------ */
/*  LIGHT EMISSION — Warm radial glow from each program location       */
/*                                                                     */
/*  Each diya (lamp) casts light onto the dark city map, literally     */
/*  illuminating the neighborhoods where programs take place.           */
/* ------------------------------------------------------------------ */
const GLOW_CIRCLE_LAYER: LayerSpecification = {
  id: "program-glow",
  type: "circle",
  source: "program-glows",
  paint: {
    "circle-radius": [
      "interpolate", ["linear"], ["zoom"],
      11,  30,
      14,  80,
      17, 160,
    ],
    "circle-color": ["get", "color"],
    "circle-opacity": 0.12,
    "circle-blur": 1,
  },
};

const GLOW_CIRCLE_OUTER_LAYER: LayerSpecification = {
  id: "program-glow-outer",
  type: "circle",
  source: "program-glows",
  paint: {
    "circle-radius": [
      "interpolate", ["linear"], ["zoom"],
      11,  60,
      14, 150,
      17, 300,
    ],
    "circle-color": ["get", "color"],
    "circle-opacity": 0.04,
    "circle-blur": 1,
  },
};

/* ------------------------------------------------------------------ */
/*  CINEMATIC FLY-TO SETTINGS                                          */
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
  const [introVisible, setIntroVisible] = useState(true);
  const [introExited, setIntroExited] = useState(false);
  const [templeActive, setTempleActive] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isFlying, setIsFlying] = useState(false);

  /* ---- Build GeoJSON for golden threads (connection lines) ---- */
  const threadsGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = [];
    for (let i = 0; i < programs.length; i++) {
      for (let j = i + 1; j < programs.length; j++) {
        const a = programs[i];
        const b = programs[j];
        // Only connect programs within ~10km of each other (roughly 0.1 degrees)
        const dist = Math.sqrt(
          (a.longitude - b.longitude) ** 2 + (a.latitude - b.latitude) ** 2
        );
        if (dist < 0.12) {
          features.push({
            type: "Feature" as const,
            geometry: {
              type: "LineString" as const,
              coordinates: [
                [a.longitude, a.latitude],
                [b.longitude, b.latitude],
              ],
            },
            properties: {},
          });
        }
      }
    }
    return { type: "FeatureCollection", features };
  }, [programs]);

  /* ---- Build GeoJSON for light emission circles ---- */
  const glowGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = programs.map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        color: getCategoryColor(p.category).bg,
      },
    }));
    return { type: "FeatureCollection", features };
  }, [programs]);

  /* ---- Map loaded callback — sets fog, map ready behind intro ---- */
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.setFog(FOG_CONFIG as Parameters<typeof map.setFog>[0]);
    setMapLoaded(true);
  }, []);

  /* ---- Intro exit → fly to ISKCON temple and stay there ---- */
  const handleIntroExit = useCallback(() => {
    setIntroVisible(false);
    setIntroExited(true);
    setIsFlying(true);

    // Cinematic dive into the ISKCON temple — camera stays here
    mapRef.current?.flyTo({
      ...ISKCON_TEMPLE,
      duration: 4500,
      essential: true,
      curve: 1.6,
      speed: 0.5,
    });

    // After landing, show temple info card
    setTimeout(() => {
      setIsFlying(false);
      setTempleActive(true);
    }, 4700);
  }, []);

  /* ---- Toggle temple info when temple marker is clicked ---- */
  const handleTempleClick = useCallback(() => {
    if (templeActive) {
      setTempleActive(false);
      return;
    }

    // If a program is selected, deselect it first
    setSelectedProgram(null);
    setTempleActive(true);
    setIsFlying(true);

    mapRef.current?.flyTo({
      ...ISKCON_TEMPLE,
      duration: 2500,
      essential: true,
      curve: 1.42,
      speed: 0.9,
    });

    setTimeout(() => setIsFlying(false), 2700);
  }, [templeActive]);

  /* ---- Cinematic fly-to when a marker is clicked ---- */
  const handleSelectProgram = useCallback(
    (program: Program) => {
      // Toggle off if clicking the already-selected marker
      if (selectedProgram?.id === program.id) {
        setSelectedProgram(null);
        return;
      }

      setSelectedProgram(program);
      setTempleActive(false); // dismiss temple card when navigating to a program
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
      <div className="flex h-full w-full items-center justify-center bg-[#0a0a1a] text-white">
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
    <div className="relative h-full w-full overflow-hidden">

      {/* ============================================================ */}
      {/*  LOADING OVERLAY (z-10)                                      */}
      {/*  Dark screen that fades out once map tiles are loaded.        */}
      {/* ============================================================ */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-[#0a0a1a] transition-opacity duration-1000 ${
          mapLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* ============================================================ */}
      {/*  HERO INTRO (z-50) — Cinematic landing overlay                */}
      {/*  Shows on first load, dissolves when user clicks "Explore"    */}
      {/* ============================================================ */}
      <HeroIntro
        visible={introVisible && mapLoaded}
        onEnter={handleIntroExit}
      />

      {/* ============================================================ */}
      {/*  WARM VIGNETTE OVERLAY (z-5)                                  */}
      {/*  Saffron/gold gradient edges make the dark map feel warm      */}
      {/*  and intentional rather than empty. Fades in after intro.     */}
      {/* ============================================================ */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[5]"
        initial={{ opacity: 0 }}
        animate={{ opacity: introExited ? 1 : 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        {/* Top edge — warm saffron glow */}
        <div
          className="absolute inset-x-0 top-0 h-48"
          style={{
            background: "linear-gradient(to bottom, rgba(232, 117, 26, 0.06) 0%, transparent 100%)",
          }}
        />
        {/* Bottom edge — deeper warm glow */}
        <div
          className="absolute inset-x-0 bottom-0 h-56"
          style={{
            background: "linear-gradient(to top, rgba(232, 117, 26, 0.08) 0%, rgba(212, 168, 67, 0.03) 40%, transparent 100%)",
          }}
        />
        {/* Left edge */}
        <div
          className="absolute inset-y-0 left-0 w-32"
          style={{
            background: "linear-gradient(to right, rgba(10, 10, 26, 0.6) 0%, transparent 100%)",
          }}
        />
        {/* Right edge */}
        <div
          className="absolute inset-y-0 right-0 w-32"
          style={{
            background: "linear-gradient(to left, rgba(10, 10, 26, 0.6) 0%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* ============================================================ */}
      {/*  NAVBAR (z-40) — fades in after intro exits                   */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: introExited ? 1 : 0,
          y: introExited ? 0 : -20,
        }}
        transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
      >
        <Navbar />
      </motion.div>

      {/* ============================================================ */}
      {/*  RESET VIEW BUTTON (z-30)                                    */}
      {/*  Visible only when a program is selected.                    */}
      {/*  Positioned below navbar (top-20) on desktop.                */}
      {/* ============================================================ */}
      <ResetViewButton
        visible={introExited && mapLoaded && selectedProgram !== null}
        onClick={handleResetView}
      />

      {/* ============================================================ */}
      {/*  PROGRAM CAROUSEL (z-30)                                     */}
      {/*  Horizontally scrollable card strip at the bottom.            */}
      {/*  ISKCON temple card is always the first card.                 */}
      {/*  Scroll/swipe between cards → camera flies to each location. */}
      {/* ============================================================ */}
      <ProgramCarousel
        programs={programs}
        selectedProgram={selectedProgram}
        onSelect={handleSelectProgram}
        onClose={handleResetView}
        visible={introExited && (selectedProgram !== null || templeActive)}
        templeActive={templeActive}
        onTempleSelect={handleTempleClick}
      />

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
          longitude: INTRO_VIEW.center[0],
          latitude: INTRO_VIEW.center[1],
          zoom: INTRO_VIEW.zoom,
          pitch: INTRO_VIEW.pitch,
          bearing: INTRO_VIEW.bearing,
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

        {/* ============================================================ */}
        {/*  LIGHT EMISSION — Warm radial glow from each diya/marker     */}
        {/*  Rendered BELOW buildings so light bleeds onto the map floor  */}
        {/* ============================================================ */}
        <Source id="program-glows" type="geojson" data={glowGeoJSON}>
          <Layer {...GLOW_CIRCLE_OUTER_LAYER} />
          <Layer {...GLOW_CIRCLE_LAYER} />
        </Source>

        {/* ============================================================ */}
        {/*  GOLDEN THREADS — Sūtra lines connecting program locations    */}
        {/* ============================================================ */}
        <Source id="threads" type="geojson" data={threadsGeoJSON}>
          <Layer {...THREAD_GLOW_LAYER} />
          <Layer {...THREAD_LINE_LAYER} />
        </Source>

        {/* ---- ISKCON Temple marker (unique Krishna-themed) ---- */}
        <TempleMarker
          onClick={handleTempleClick}
          isActive={templeActive}
        />

        {/* ---- Program markers (diya flames rendered inside map) ---- */}
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
