"use client";

import { useCallback, useRef, useState } from "react";
import Map, { Layer, Source } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { LayerSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { PROGRAMS } from "@/data/programs";
import type { Program } from "@/data/programs";
import ProgramMarker from "@/components/ProgramMarker";

/* ------------------------------------------------------------------ */
/*  Mapbox access token — set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local  */
/* ------------------------------------------------------------------ */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/* ------------------------------------------------------------------ */
/*  Initial camera: cinematic 3D view over the Hudson River           */
/*  Captures both Manhattan (east) and Jersey City (west)             */
/* ------------------------------------------------------------------ */
const INITIAL_VIEW = {
  longitude: -74.02,
  latitude: 40.72,
  zoom: 14.5,
  pitch: 60,
  bearing: -17.6,
};

/* ------------------------------------------------------------------ */
/*  3D building layer — extruded from Mapbox composite source         */
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
/*  Sky layer — atmospheric gradient for depth                        */
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
/*  Fog for cinematic depth                                           */
/* ------------------------------------------------------------------ */
const FOG_CONFIG = {
  range: [1, 12],
  color: "#0a0a1a",
  "high-color": "#1a0a2e",
  "horizon-blend": 0.1,
  "star-intensity": 0.15,
};

export default function MapScene() {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.setFog(FOG_CONFIG as Parameters<typeof map.setFog>[0]);
    setMapLoaded(true);
  }, []);

  /* ---- Select a program & fly camera toward it ---- */
  const handleSelectProgram = useCallback(
    (program: Program) => {
      setSelectedProgram((prev) => (prev?.id === program.id ? null : program));

      mapRef.current?.flyTo({
        center: [program.longitude, program.latitude],
        zoom: 15.5,
        pitch: 62,
        bearing: -10,
        duration: 1800,
        essential: true,
      });
    },
    [],
  );

  /* ---- Click on empty map → deselect ---- */
  const handleMapClick = useCallback(() => {
    setSelectedProgram(null);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a1a] text-white">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold">Mapbox Token Required</h1>
          <p className="text-gray-400">
            Set <code className="rounded bg-white/10 px-2 py-1">NEXT_PUBLIC_MAPBOX_TOKEN</code> in
            your <code className="rounded bg-white/10 px-2 py-1">.env.local</code> file to load the
            map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Loading overlay — fades out once map tiles are ready */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-[#0a0a1a] transition-opacity duration-1000 ${
          mapLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
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
        {/* Mapbox DEM source for terrain */}
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

        {/* ---- Program markers ---- */}
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
