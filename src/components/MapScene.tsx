"use client";

/**
 * MapScene — Clean 2D Mapbox map with pill markers (Airbnb-style)
 *
 * Flat, light-themed map. No 3D buildings, fog, sky, terrain, or
 * cinematic animations. Just a responsive map with program markers.
 *
 * Selection state is now lifted to SplitView so that clicking a
 * marker opens the detail view in the left panel.
 */

import { useCallback, useEffect, useRef, useState } from "react";
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
  selectedProgramId?: string | null;
  /** Triggers a gentle fly-to without opening detail view (used by mobile carousel scroll) */
  focusedProgramId?: string | null;
  onSelectProgram?: (program: Program) => void;
}

export default function MapScene({
  programs,
  hoveredProgramId = null,
  selectedProgramId = null,
  focusedProgramId = null,
  onSelectProgram,
}: MapSceneProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const onMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  // Fly to selected program when it changes
  useEffect(() => {
    if (!selectedProgramId || !mapLoaded) return;
    const program = programs.find((p) => p.id === selectedProgramId);
    if (program) {
      mapRef.current?.flyTo({
        center: [program.longitude, program.latitude],
        zoom: 14,
        duration: 800,
        essential: true,
      });
    }
  }, [selectedProgramId, mapLoaded, programs]);

  // Reset view when deselected
  useEffect(() => {
    if (selectedProgramId === null && mapLoaded) {
      mapRef.current?.flyTo({
        center: [DEFAULT_VIEW.longitude, DEFAULT_VIEW.latitude],
        zoom: DEFAULT_VIEW.zoom,
        duration: 800,
        essential: true,
      });
    }
  }, [selectedProgramId, mapLoaded]);

  // Gentle fly-to when focused program changes (mobile carousel scroll)
  useEffect(() => {
    if (!focusedProgramId || !mapLoaded || selectedProgramId) return;
    const program = programs.find((p) => p.id === focusedProgramId);
    if (program) {
      mapRef.current?.flyTo({
        center: [program.longitude, program.latitude],
        zoom: 13,
        duration: 600,
        essential: true,
      });
    }
  }, [focusedProgramId, mapLoaded, selectedProgramId, programs]);

  const handleMarkerSelect = useCallback(
    (program: Program) => {
      onSelectProgram?.(program);
    },
    [onSelectProgram],
  );

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
      {/* Warm loading skeleton */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-[#FFF9F0] transition-opacity duration-700 flex flex-col items-center justify-center ${
          mapLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        {!mapLoaded && (
          <div className="flex flex-col items-center gap-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 28 28"
              fill="none"
              className="animate-lotus-pulse"
            >
              <circle cx="14" cy="14" r="13" stroke="#E8751A" strokeWidth="1.2" opacity="0.3" />
              <path
                d="M14 6c-2 3-5 6-5 9a5 5 0 0 0 10 0c0-3-3-6-5-9Z"
                fill="#E8751A"
                opacity="0.6"
              />
              <path
                d="M14 10c-1.2 2-3 4-3 5.8a3 3 0 0 0 6 0c0-1.8-1.8-3.8-3-5.8Z"
                fill="#D4A843"
                opacity="0.5"
              />
            </svg>
            <p className="text-[13px] text-[#C4883A] tracking-wide">Loading map…</p>
          </div>
        )}
      </div>

      {/* Warm left-edge vignette for softer panel transition */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-10 bg-gradient-to-r from-[#FFF9F0]/25 to-transparent hidden md:block" />

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
      >
        {programs.map((program) => (
          <ProgramMarker
            key={program.id}
            program={program}
            isSelected={selectedProgramId === program.id}
            isHovered={hoveredProgramId === program.id}
            onSelect={handleMarkerSelect}
          />
        ))}
      </Map>
    </div>
  );
}
