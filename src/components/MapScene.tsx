"use client";

/**
 * MapScene — Clean 2D Mapbox map with pill markers (Airbnb-style)
 *
 * Flat, light-themed map. No 3D buildings, fog, sky, terrain, or
 * cinematic animations. Just a responsive map with program markers.
 */

import { useCallback, useRef, useState } from "react";
import Map from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import type { Program } from "@/data/programs";
import ProgramMarker from "@/components/ProgramMarker";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/** Default view — shows NYC area programs */
const DEFAULT_VIEW = {
  longitude: -74.005,
  latitude: 40.72,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

const MAP_BOUNDS: [number, number, number, number] = [
  -74.15, 40.55,
  -73.85, 41.30,
];

const MIN_ZOOM = 10;
const MAX_ZOOM = 18;

interface MapSceneProps {
  programs: Program[];
  hoveredProgramId?: string | null;
}

export default function MapScene({ programs, hoveredProgramId = null }: MapSceneProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const onMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  const handleSelectProgram = useCallback(
    (program: Program) => {
      if (selectedProgram?.id === program.id) {
        setSelectedProgram(null);
        return;
      }

      setSelectedProgram(program);

      mapRef.current?.flyTo({
        center: [program.longitude, program.latitude],
        zoom: 14,
        duration: 800,
        essential: true,
      });
    },
    [selectedProgram],
  );

  const handleMapClick = useCallback(() => {
    setSelectedProgram(null);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white text-gray-900">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold">Mapbox Token Required</h1>
          <p className="text-gray-500">
            Set{" "}
            <code className="rounded bg-gray-100 px-2 py-1">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            in your{" "}
            <code className="rounded bg-gray-100 px-2 py-1">.env.local</code>{" "}
            file to load the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Loading overlay */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-gray-50 transition-opacity duration-700 ${
          mapLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      <Map
        ref={mapRef}
        initialViewState={DEFAULT_VIEW}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100%" }}
        maxBounds={MAP_BOUNDS}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxPitch={0}
        dragRotate={false}
        touchZoomRotate={true}
        onLoad={onMapLoad}
        onClick={handleMapClick}
      >
        {programs.map((program) => (
          <ProgramMarker
            key={program.id}
            program={program}
            isSelected={selectedProgram?.id === program.id}
            isHovered={hoveredProgramId === program.id}
            onSelect={handleSelectProgram}
          />
        ))}
      </Map>
    </div>
  );
}
