"use client";

/**
 * VenueMap — real street map for the venue bento card.
 *
 * Renders an interactive Mapbox map (dark style, matching the candlelit
 * theme) centered on EVENT.venue.lat/lng with a glowing gold pin.
 * Scroll zoom is off so the page keeps scrolling normally; drag and
 * double-click still work. Without NEXT_PUBLIC_MAPBOX_TOKEN it falls
 * back to the stylized street grid so the card never breaks.
 */

import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Icon } from "@/components/home/icons";
import { EVENT } from "@/data/bhajanClubbing";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

function GlowPin() {
  return (
    <div className="relative">
      <span
        className="bc-glow-pulse absolute -inset-4 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,162,72,0.5), transparent 70%)" }}
        aria-hidden
      />
      <span
        className="relative flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: "var(--bc3-gold)", boxShadow: "0 0 22px rgba(201,162,72,0.85)" }}
      >
        <Icon name="mapPin" size={17} style={{ color: "#241205" }} />
      </span>
    </div>
  );
}

/** Token-less fallback — abstract downtown grid with the glowing pin. */
function StylizedFallback() {
  return (
    <>
      <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
        <g stroke="rgba(201,162,72,0.28)" strokeWidth="1.5">
          <path d="M-10 40 H410" />
          <path d="M-10 85 H410" />
          <path d="M-10 130 H410" />
          {[40, 95, 150, 205, 260, 315, 370].map((x) => (
            <path key={x} d={`M${x} -10 V180`} strokeWidth="1" />
          ))}
          <path d="M-10 160 L410 10" stroke="rgba(217,105,26,0.4)" strokeWidth="2.5" />
        </g>
        <rect x="262" y="42" width="51" height="41" rx="4" fill="rgba(201,162,72,0.1)" stroke="rgba(201,162,72,0.25)" />
        {[[95, 85], [205, 130], [315, 40]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.5" fill="none" stroke="rgba(237,214,152,0.7)" strokeWidth="1.4" />
        ))}
      </svg>
      <div className="absolute left-[46%] top-[42%] -translate-x-1/2 -translate-y-1/2">
        <GlowPin />
      </div>
    </>
  );
}

export default function VenueMap() {
  return (
    <div
      className="relative mt-5 h-[150px] overflow-hidden rounded-xl sm:h-[170px]"
      style={{ background: "rgba(16,10,5,0.55)", border: "1px solid var(--bc3-line)" }}
    >
      {MAPBOX_TOKEN ? (
        <Map
          initialViewState={{ latitude: EVENT.venue.lat, longitude: EVENT.venue.lng, zoom: 12.4 }}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: "100%", height: "100%" }}
          scrollZoom={false}
          dragRotate={false}
          maxPitch={0}
          attributionControl={false}
        >
          <Marker latitude={EVENT.venue.lat} longitude={EVENT.venue.lng} anchor="center">
            <GlowPin />
          </Marker>
        </Map>
      ) : (
        <StylizedFallback />
      )}
      <span
        className="pointer-events-none absolute bottom-2.5 left-3 rounded-full px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.16em]"
        style={{ background: "rgba(16,10,5,0.78)", color: "var(--bc3-gold-hi)", border: "1px solid var(--bc3-line)" }}
      >
        Jersey City
      </span>
    </div>
  );
}
