/**
 * Shared icon set for the homepage sections.
 * Stroke-based, 24x24 viewBox, inherits `currentColor`.
 */

import type { SVGProps } from "react";

type IconName =
  | "book"
  | "music"
  | "gift"
  | "mountain"
  | "food"
  | "handshake"
  | "camera"
  | "trophy"
  | "calendar"
  | "lotus"
  | "mapPin"
  | "arrowRight"
  | "sparkle"
  | "flame"
  | "share";

export function Icon({
  name,
  size = 22,
  ...props
}: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };

  switch (name) {
    case "book":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      );
    case "music":
      return (
        <svg {...common}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
        </svg>
      );
    case "mountain":
      return (
        <svg {...common}>
          <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
        </svg>
      );
    case "food":
      return (
        <svg {...common}>
          <path d="M18 8h1a4 4 0 010 8h-1" />
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case "handshake":
      return (
        <svg {...common}>
          <path d="M11 17l2 2a1 1 0 103-3" />
          <path d="M14 16l2.5 2.5a1 1 0 003-3l-3.88-3.88a1 1 0 00-1.24 0l-.76.76a1 1 0 001.41 1.41" />
          <path d="M22 11l-3-3L5 20l3 3z" />
          <path d="M2 11l3-3 14 14-3 3z" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0012 0V2z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "lotus":
      return (
        <svg {...common}>
          <path d="M12 22c-4 0-7-2-7-6 0-1 .3-2 .8-3" />
          <path d="M12 22c4 0 7-2 7-6 0-1-.3-2-.8-3" />
          <path d="M12 22s-3-4-3-8 3-8 3-8 3 4 3 8-3 8-3 8z" />
          <path d="M5.8 13c-1.8 0-3.3-1.5-3.3-3 3-1 5.5 1 5.5 3" />
          <path d="M18.2 13c1.8 0 3.3-1.5 3.3-3-3-1-5.5 1-5.5 3" />
        </svg>
      );
    case "mapPin":
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "arrowRight":
      return (
        <svg {...common} viewBox="0 0 16 16" width={size} height={size}>
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
        </svg>
      );
    case "flame":
      return (
        <svg {...common}>
          <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      );
    default:
      return null;
  }
}

/** Color tokens shared by homepage components.
 *  Tuned to harmonise with the warm paper palette in globals.css. */
export const C = {
  krishnaBlue: "#15224F",
  krishnaDeep: "#0F1B4D",
  krishnaLight: "#2E3F8F",
  gold: "#C9A248",
  goldLight: "#EDD698",
  saffron: "#D9691A",
  peacock: "#006D5B",
  peacockLight: "#00917A",
  lotusPink: "#C84682",
  cream: "#CCC2A8",
  warmBg: "#AEA487",
} as const;

export function colorFor(token: "gold" | "saffron" | "peacock" | "lotus" | "krishna"): string {
  switch (token) {
    case "gold":
      return C.gold;
    case "saffron":
      return C.saffron;
    case "peacock":
      return C.peacock;
    case "lotus":
      return C.lotusPink;
    case "krishna":
      return C.krishnaBlue;
  }
}
