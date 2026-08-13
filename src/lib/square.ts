/**
 * square.ts — shared Square REST config (no SDK dependency).
 *
 * Same env contract as the Bhajan Clubbing checkout:
 *   SQUARE_ACCESS_TOKEN   required — from the Square developer dashboard
 *   SQUARE_LOCATION_ID    required — the seller location to credit
 *   SQUARE_ENVIRONMENT    "production" (default) or "sandbox"
 *   SQUARE_API_BASE       test override
 *
 * Route files may only export HTTP handlers, so new payment routes pull
 * these helpers from here. (The original bhajanclubbing checkout route
 * keeps its private copies — one live flow, zero churn.)
 */

export interface SquareConfig {
  token: string;
  locationId: string;
  base: string;
}

export function squareConfig(): SquareConfig | null {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!token || !locationId) return null;
  const base =
    process.env.SQUARE_API_BASE || // test override
    (process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? "https://connect.squareupsandbox.com"
      : "https://connect.squareup.com");
  return { token, locationId, base };
}

export function squareHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/** Whether Square is configured, i.e. payments can actually be taken. */
export function squareConfigured(): boolean {
  return !!(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}
