"use client";

/**
 * MapScene — Full-screen 3D Mapbox map with Vedic / Treta Yuga aesthetic
 *
 * DESIGN CONCEPTS (Vedic Enhancement):
 * ├── "Sacred Fire" — Agni kunda markers cast divine light on ancient-styled map
 * ├── "Nadi Lines" — Sacred energy channels connecting programs (replaces golden threads)
 * ├── "Sri Yantra" — Sacred geometry overlay radiating from the temple (Mount Meru)
 * ├── "Vedic Border" — Ornamental manuscript frame with Yuga corner medallions
 * └── Together: "An ancient map illuminating the path of divine wisdom across the city"
 *
 * Z-INDEX HIERARCHY:
 * ├── z-0  — Mapbox GL canvas (base layer)
 * ├── z-3  — Sacred geometry overlay
 * ├── z-5  — Vedic parchment vignette
 * ├── z-6  — Vedic ornamental border
 * ├── z-10 — Loading overlay
 * ├── z-20 — Mapbox attribution / logo
 * ├── z-30 — ResetViewButton & ProgramCarousel
 * └── z-40 — Navbar
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
import VedicBorder from "@/components/VedicBorder";
import SacredGeometry from "@/components/SacredGeometry";

/* ================================================================== */
/*  CONFIGURATION                                                       */
/* ================================================================== */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/** INTRO_VIEW — Starting camera: high altitude, looking down */
const INTRO_VIEW = {
  center: [-74.005, 40.72] as [number, number],
  zoom: 10.5,
  pitch: 0,
  bearing: 0,
};

/** ISKCON_TEMPLE — 305 Schermerhorn St, Brooklyn */
const ISKCON_TEMPLE = {
  center: [-73.9817, 40.6867] as [number, number],
  zoom: 17,
  pitch: 72,
  bearing: 40,
};

/** HOME_VIEW — Establishing shot after temple fly-by */
const HOME_VIEW = {
  center: [-74.005, 40.72] as [number, number],
  zoom: 13,
  pitch: 58,
  bearing: -17,
};

const MAP_BOUNDS: [number, number, number, number] = [
  -74.08, 40.63,
  -73.92, 40.80,
];

const MIN_ZOOM = 11;
const MAX_ZOOM = 18;

/* ------------------------------------------------------------------ */
/*  3D BUILDING LAYER — Vedic sandstone/temple-stone palette            */
/*                                                                     */
/*  Buildings now resemble ancient stone temples:                        */
/*    0m   → #2a1f14  (dark earth)                                     */
/*    50m  → #3d2b1a  (aged sandstone)                                 */
/*    100m → #5c4022  (warm temple stone)                              */
/*    200m → #8B6914  (golden sandstone)                               */
/*    300m → #D4A843  (gilded temple spire)                            */
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
      0,   "#2a1f14",       // dark earth base
      50,  "#3d2b1a",       // aged sandstone
      100, "#5c4022",       // warm temple stone
      200, "#8B6914",       // golden sandstone
      300, "#D4A843",       // gilded temple spire
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
/*  SKY LAYER — Dawn over ancient Bharatavarsha                         */
/* ------------------------------------------------------------------ */
const SKY_LAYER: LayerSpecification = {
  id: "sky",
  type: "sky",
  paint: {
    "sky-type": "atmosphere",
    "sky-atmosphere-sun": [0.0, 75.0],       // sunrise position
    "sky-atmosphere-sun-intensity": 12,
  },
};

/* ------------------------------------------------------------------ */
/*  FOG — Golden dawn haze (Vedic sunrise atmosphere)                   */
/*  Warm golden tones replacing the cold purple-navy                    */
/* ------------------------------------------------------------------ */
const FOG_CONFIG = {
  range: [1, 12],
  color: "#1a150e",                    // warm dark earth
  "high-color": "#3d2b1a",            // sandstone horizon
  "horizon-blend": 0.2,
  "star-intensity": 0.15,             // subtle celestial presence
};

/* ------------------------------------------------------------------ */
/*  NADI LINES — Sacred energy channels (replaces golden threads)       */
/*                                                                     */
/*  Inspired by "nadi" — the energy channels described in Vedic texts. */
/*  These flowing lines connect programs like rivers of divine energy.  */
/* ------------------------------------------------------------------ */
const NADI_LINE_LAYER: LayerSpecification = {
  id: "nadi-channels",
  type: "line",
  source: "threads",
  paint: {
    "line-color": "#D4A843",
    "line-width": [
      "interpolate", ["linear"], ["zoom"],
      11, 1,
      15, 2,
    ],
    "line-opacity": 0.35,
    "line-dasharray": [3, 6, 1, 6],    // flowing river-like pattern
  },
};

const NADI_GLOW_LAYER: LayerSpecification = {
  id: "nadi-channels-glow",
  type: "line",
  source: "threads",
  paint: {
    "line-color": "#E8751A",
    "line-width": [
      "interpolate", ["linear"], ["zoom"],
      11, 4,
      15, 8,
    ],
    "line-opacity": 0.06,
    "line-blur": 8,
  },
};

/** Secondary sacred glow — subtle amber aura around nadi lines */
const NADI_AURA_LAYER: LayerSpecification = {
  id: "nadi-channels-aura",
  type: "line",
  source: "threads",
  paint: {
    "line-color": "#D4A843",
    "line-width": [
      "interpolate", ["linear"], ["zoom"],
      11, 10,
      15, 18,
    ],
    "line-opacity": 0.025,
    "line-blur": 14,
  },
};

/* ------------------------------------------------------------------ */
/*  SACRED FIRE GLOW — Radial light from each agni kunda               */
/* ------------------------------------------------------------------ */
const GLOW_CIRCLE_LAYER: LayerSpecification = {
  id: "program-glow",
  type: "circle",
  source: "program-glows",
  paint: {
    "circle-radius": [
      "interpolate", ["linear"], ["zoom"],
      11,  35,
      14,  90,
      17, 180,
    ],
    "circle-color": ["get", "color"],
    "circle-opacity": 0.14,
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
      11,  70,
      14, 170,
      17, 340,
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

  /* ---- Build GeoJSON for nadi channels (energy lines) ---- */
  const threadsGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = [];
    for (let i = 0; i < programs.length; i++) {
      for (let j = i + 1; j < programs.length; j++) {
        const a = programs[i];
        const b = programs[j];
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

  /* ---- Build GeoJSON for sacred fire glow circles ---- */
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

  /* ---- Map load — apply Vedic style transformations ---- */
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Apply golden dawn fog
    map.setFog(FOG_CONFIG as Parameters<typeof map.setFog>[0]);

    // Vedic water styling — deep indigo sacred rivers
    try {
      map.setPaintProperty("water", "fill-color", "#0d1b2a");
      map.setPaintProperty("water", "fill-opacity", 0.9);
    } catch {
      // Layer might not exist yet
    }

    // Warm earth-toned land
    try {
      map.setPaintProperty("land", "background-color", "#1a150e");
    } catch {
      // Layer might not exist
    }

    // Dim road labels for ancient feel
    try {
      const style = map.getStyle();
      if (style?.layers) {
        for (const layer of style.layers) {
          // Mute road lines to warm brown
          if (layer.id.includes("road") && layer.type === "line") {
            try {
              map.setPaintProperty(layer.id, "line-color", "#2a1f14");
              map.setPaintProperty(layer.id, "line-opacity", 0.4);
            } catch { /* skip */ }
          }
          // Mute labels to warm gold
          if (layer.type === "symbol" && layer.id.includes("label")) {
            try {
              map.setPaintProperty(layer.id, "text-color", "#8B6914");
              map.setPaintProperty(layer.id, "text-opacity", 0.5);
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      // Style not fully loaded
    }

    setMapLoaded(true);
  }, []);

  /* ---- Intro exit → fly to ISKCON temple ---- */
  const handleIntroExit = useCallback(() => {
    setIntroVisible(false);
    setIntroExited(true);
    setIsFlying(true);

    mapRef.current?.flyTo({
      ...ISKCON_TEMPLE,
      duration: 4500,
      essential: true,
      curve: 1.6,
      speed: 0.5,
    });

    setTimeout(() => {
      setIsFlying(false);
      setTempleActive(true);
    }, 4700);
  }, []);

  /* ---- Toggle temple info ---- */
  const handleTempleClick = useCallback(() => {
    if (templeActive) {
      setTempleActive(false);
      return;
    }

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

  /* ---- Fly-to program marker ---- */
  const handleSelectProgram = useCallback(
    (program: Program) => {
      if (selectedProgram?.id === program.id) {
        setSelectedProgram(null);
        return;
      }

      setSelectedProgram(program);
      setTempleActive(false);
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

  /* ---- Click on empty map → deselect ---- */
  const handleMapClick = useCallback(() => {
    if (!isFlying) {
      setSelectedProgram(null);
    }
  }, [isFlying]);

  /* ---- Reset View ---- */
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
      <div className="flex h-screen w-screen items-center justify-center bg-[#1a150e] text-white">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-[#D4A843]">Mapbox Token Required</h1>
          <p className="text-[#8B6914]/70">
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
      {/* ============================================================ */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-[#1a150e] transition-opacity duration-1000 ${
          mapLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* ============================================================ */}
      {/*  HERO INTRO (z-50)                                            */}
      {/* ============================================================ */}
      <HeroIntro
        visible={introVisible && mapLoaded}
        onEnter={handleIntroExit}
      />

      {/* ============================================================ */}
      {/*  SACRED GEOMETRY OVERLAY (z-3)                                */}
      {/*  Sri Yantra / mandala radiating from the center               */}
      {/* ============================================================ */}
      <SacredGeometry visible={introExited} />

      {/* ============================================================ */}
      {/*  VEDIC PARCHMENT VIGNETTE (z-5)                              */}
      {/*  Warm sandstone/gold gradient edges                           */}
      {/* ============================================================ */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[5]"
        initial={{ opacity: 0 }}
        animate={{ opacity: introExited ? 1 : 0 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        {/* Top edge — ancient parchment glow */}
        <div
          className="absolute inset-x-0 top-0 h-48"
          style={{
            background: "linear-gradient(to bottom, rgba(139, 105, 20, 0.1) 0%, rgba(212, 168, 67, 0.04) 40%, transparent 100%)",
          }}
        />
        {/* Bottom edge — deeper warm earth glow */}
        <div
          className="absolute inset-x-0 bottom-0 h-56"
          style={{
            background: "linear-gradient(to top, rgba(139, 105, 20, 0.12) 0%, rgba(212, 168, 67, 0.04) 40%, transparent 100%)",
          }}
        />
        {/* Left edge — aged manuscript */}
        <div
          className="absolute inset-y-0 left-0 w-40"
          style={{
            background: "linear-gradient(to right, rgba(26, 21, 14, 0.7) 0%, transparent 100%)",
          }}
        />
        {/* Right edge */}
        <div
          className="absolute inset-y-0 right-0 w-40"
          style={{
            background: "linear-gradient(to left, rgba(26, 21, 14, 0.7) 0%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* ============================================================ */}
      {/*  VEDIC BORDER FRAME (z-6)                                    */}
      {/*  Ornamental manuscript border with Yuga corner medallions     */}
      {/* ============================================================ */}
      <VedicBorder visible={introExited} />

      {/* ============================================================ */}
      {/*  NAVBAR (z-40)                                                */}
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
      {/* ============================================================ */}
      <ResetViewButton
        visible={introExited && mapLoaded && selectedProgram !== null}
        onClick={handleResetView}
      />

      {/* ============================================================ */}
      {/*  PROGRAM CAROUSEL (z-30)                                     */}
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
      {/*  MAPBOX GL MAP — Vedic dark-v11 with style overrides          */}
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
        {/* Terrain DEM source */}
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        {/* 3D sandstone buildings */}
        <Layer {...BUILDING_3D_LAYER} />

        {/* Vedic dawn sky */}
        <Layer {...SKY_LAYER} />

        {/* Sacred fire glow — warm radial light from each agni kunda */}
        <Source id="program-glows" type="geojson" data={glowGeoJSON}>
          <Layer {...GLOW_CIRCLE_OUTER_LAYER} />
          <Layer {...GLOW_CIRCLE_LAYER} />
        </Source>

        {/* Nadi channels — sacred energy lines connecting programs */}
        <Source id="threads" type="geojson" data={threadsGeoJSON}>
          <Layer {...NADI_AURA_LAYER} />
          <Layer {...NADI_GLOW_LAYER} />
          <Layer {...NADI_LINE_LAYER} />
        </Source>

        {/* ISKCON Temple marker — Vedic vimana */}
        <TempleMarker
          onClick={handleTempleClick}
          isActive={templeActive}
        />

        {/* Program markers — sacred fire altars */}
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
