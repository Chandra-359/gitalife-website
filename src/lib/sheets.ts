/**
 * sheets.ts — best-effort Google Sheets logging for event registrations.
 *
 * Appends one row per confirmed Bhajan Clubbing registration to the
 * shared tracking spreadsheet. Talks to the Sheets REST API directly
 * with a service-account JWT (no googleapis dependency), mirroring how
 * the checkout route talks to Square.
 *
 * Setup:
 *  1. In Google Cloud Console → IAM & Admin → Service Accounts, create a
 *     service account and download a JSON key. Enable the Google Sheets
 *     API for the project.
 *  2. Share the spreadsheet with the service account's email address
 *     (Editor access) — appends fail with 403 otherwise.
 *  3. Configure env:
 *       GOOGLE_SERVICE_ACCOUNT_EMAIL  "client_email" from the JSON key
 *       GOOGLE_SERVICE_ACCOUNT_KEY    "private_key" from the JSON key —
 *                                     paste as-is; escaped "\n" and real
 *                                     newlines both work
 *       GOOGLE_SHEETS_ID              optional — defaults to the Bhajan
 *                                     Clubbing registrations sheet
 *
 * Rows land on the first tab, after the last non-empty row, as:
 *   Registered At (ET) · Full Name · Email · Mobile · Tickets ·
 *   Heard Via · Email Opt-In · Ticket · Payment
 *
 * Logging is best-effort: when the account isn't configured or the
 * append fails, callers get `false` back and the registration carries
 * on — the database row stays the source of truth.
 */

import { createSign } from "node:crypto";

/** https://docs.google.com/spreadsheets/d/<id>/edit */
const DEFAULT_SHEET_ID = "1eXP2DOKCJ6czDWXUss5ABj48W_DQ-e8uJ1dssiP_GCg";

/** Weekly-program registrations (door check-in) land here by default. */
const DEFAULT_PROGRAMS_SHEET_ID = "15n_4AU_g3LEVPzWwvkC3bptOxmqZZ4PdCiHoAqjSJ7A";

function sheetsConfig() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;
  return { email, key, sheetId: process.env.GOOGLE_SHEETS_ID || DEFAULT_SHEET_ID };
}

export function sheetsConfigured(): boolean {
  return !!sheetsConfig();
}

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Service-account OAuth token, cached until shortly before expiry. */
let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(cfg: NonNullable<ReturnType<typeof sheetsConfig>>): Promise<string | null> {
  if (cached && Date.now() < cached.expiresAt - 60_000) return cached.token;

  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    b64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) +
    "." +
    b64url(
      JSON.stringify({
        iss: cfg.email,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      }),
    );
  const signature = createSign("RSA-SHA256").update(unsigned).sign(cfg.key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${b64url(signature)}`,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    console.error("Google Sheets auth failed:", data.error_description ?? data);
    return null;
  }
  cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cached.token;
}

/** Append raw values as one row on the first tab of a sheet. Never throws. */
async function appendRow(sheetId: string, values: (string | number)[]): Promise<boolean> {
  try {
    const cfg = sheetsConfig();
    if (!cfg) return false;
    const token = await accessToken(cfg);
    if (!token) return false;

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [values] }),
      },
    );
    if (!res.ok) {
      console.error("Google Sheets append failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Google Sheets append error:", error);
    return false;
  }
}

export interface WeeklyProgramRow {
  program: string;   // e.g. "Newport Friday Sanga"
  name: string;
  email: string;
  phone: string;
  hearAbout: string;
}

/**
 * One row per weekly-program registration, for door check-in.
 * Uses GOOGLE_SHEETS_PROGRAMS_ID when set, else the shared sheet.
 * Columns: Registered At (ET) · Program · Full Name · Email · Mobile · Heard Via
 */
export async function appendWeeklyRegistrationToSheet(r: WeeklyProgramRow): Promise<boolean> {
  const cfg = sheetsConfig();
  if (!cfg) return false;
  const sheetId = process.env.GOOGLE_SHEETS_PROGRAMS_ID || DEFAULT_PROGRAMS_SHEET_ID;
  const registeredAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  return appendRow(sheetId, [
    registeredAt,
    r.program,
    r.name,
    r.email,
    r.phone,
    r.hearAbout || "",
  ]);
}

export interface FestivalRow {
  event: string;     // e.g. "Ratha Yatra 2026"
  name: string;
  email: string;
  phone: string;
  guests: number;
  hearAbout: string;
}

/**
 * One row per festival/event registration, for door check-in.
 * Uses GOOGLE_SHEETS_FESTIVALS_ID when set, falling back to the
 * weekly-programs sheet so everything stays in one place by default.
 * Columns: Registered At (ET) · Event · Full Name · Email · Mobile ·
 * Guests · Heard Via
 */
export async function appendFestivalRegistrationToSheet(r: FestivalRow): Promise<boolean> {
  const cfg = sheetsConfig();
  if (!cfg) return false;
  const sheetId =
    process.env.GOOGLE_SHEETS_FESTIVALS_ID ||
    process.env.GOOGLE_SHEETS_PROGRAMS_ID ||
    DEFAULT_PROGRAMS_SHEET_ID;
  const registeredAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  return appendRow(sheetId, [
    registeredAt,
    r.event,
    r.name,
    r.email,
    r.phone,
    r.guests,
    r.hearAbout || "",
  ]);
}

export interface RegistrationRow {
  name: string;
  email: string;
  phone: string;
  guests: number;
  hearAbout: string;
  emailOptIn: boolean;
  /** e.g. "General Admission" */
  ticket: string;
  /** e.g. "PAID via Square" */
  payment: string;
}

/** Append one confirmed registration as a row. Never throws. */
export async function appendRegistrationToSheet(r: RegistrationRow): Promise<boolean> {
  const cfg = sheetsConfig();
  if (!cfg) return false;
  const registeredAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  // Range "A1" targets the first tab; append finds the last row itself.
  return appendRow(cfg.sheetId, [
    registeredAt,
    r.name,
    r.email,
    r.phone,
    r.guests,
    r.hearAbout || "",
    r.emailOptIn ? "Yes" : "No",
    r.ticket,
    r.payment,
  ]);
}

/* ------------------------------------------------------------------ */
/*  Post-event feedback — a "reviews" tab in the SAME spreadsheet the  */
/*  Bhajan Clubbing registrations land in                              */
/* ------------------------------------------------------------------ */

const REVIEWS_TAB = "reviews";
const REVIEWS_HEADER = [
  "Submitted At (ET)",
  "Name",
  "Overall Rating",
  "Enjoyed Most",
  "Interested in Programs",
  "Programs",
  "INSPIRE Charity",
  "Suggestions",
];

/** Append one row to a named tab (returns false on any failure). */
async function appendToTab(
  sheetId: string,
  token: string,
  tab: string,
  values: (string | number)[],
): Promise<boolean> {
  const range = encodeURIComponent(`${tab}!A1`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    },
  );
  if (!res.ok) {
    // Expected once per spreadsheet: the tab doesn't exist yet
    console.error(`Google Sheets append to "${tab}" failed:`, res.status, await res.text());
    return false;
  }
  return true;
}

/** Create the reviews tab with its header row. Tolerates "already exists". */
async function createReviewsTab(sheetId: string, token: string): Promise<boolean> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: REVIEWS_TAB } } }] }),
  });
  if (!res.ok) {
    const text = await res.text();
    // A concurrent submission may have just created it — that's fine
    if (!text.includes("already exists")) {
      console.error("Google Sheets addSheet failed:", res.status, text);
      return false;
    }
    return true;
  }
  await appendToTab(sheetId, token, REVIEWS_TAB, REVIEWS_HEADER);
  return true;
}

export interface ReviewRow {
  name: string;
  /** 1–5 */
  rating: number;
  enjoyed: string;
  programsInterest: string;
  programs: string;
  inspire: string;
  suggestions: string;
}

/**
 * Append one feedback response to the "reviews" tab of the registrations
 * spreadsheet, creating the tab (with a header row) on first use.
 * Never throws.
 */
export async function appendReviewToSheet(r: ReviewRow): Promise<boolean> {
  try {
    const cfg = sheetsConfig();
    if (!cfg) return false;
    const token = await accessToken(cfg);
    if (!token) return false;
    const submittedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    const values = [
      submittedAt,
      r.name,
      r.rating,
      r.enjoyed,
      r.programsInterest,
      r.programs,
      r.inspire,
      r.suggestions,
    ];
    if (await appendToTab(cfg.sheetId, token, REVIEWS_TAB, values)) return true;
    // Most likely the tab doesn't exist yet — create it and retry once.
    if (!(await createReviewsTab(cfg.sheetId, token))) return false;
    return appendToTab(cfg.sheetId, token, REVIEWS_TAB, values);
  } catch (error) {
    console.error("Google Sheets review append error:", error);
    return false;
  }
}
