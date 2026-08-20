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
import { SEEDED_FESTIVAL_EVENTS } from "@/data/myf";

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
  /** Program id — resolves a seeded event's custom sheetTab. */
  eventId?: string;
  event: string;     // e.g. "Prerana Festival" — fallback tab name
  name: string;
  email: string;
  phone: string;
  whatsapp: string;      // blank = same as mobile
  location: string;      // "City, State"
  organization: string;  // university or company
  hearAbout: string;
}

const FESTIVAL_HEADER = [
  "Registered At (ET)",
  "Full Name",
  "Email",
  "Mobile",
  "WhatsApp",
  "Location",
  "University / Company",
  "Heard Via",
  "Follow-up",
];

/** Dropdown options for the Follow-up column — how the outreach team
 *  tracks each party. New rows start as "Registered". */
const FOLLOWUP_OPTIONS = ["Registered", "Called", "Did not pick", "Confirmed", "Not coming"];

/** Zero-based index of the Follow-up column (G). */
const FOLLOWUP_COLUMN = FESTIVAL_HEADER.length - 1;

/**
 * Sheets tab titles can't contain []/\?*: and cap at 100 chars — keep
 * event-named tabs safe whatever the title says.
 */
function tabTitle(raw: string): string {
  const cleaned = raw.replace(/[[\]/\\?*:]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return cleaned || "Event registrations";
}

function festivalSheetId(cfg: NonNullable<ReturnType<typeof sheetsConfig>>): string {
  return process.env.GOOGLE_SHEETS_FESTIVALS_ID || cfg.sheetId;
}

/** The tab an event's registrations land on: the seed's exact sheetTab
 *  when the event is code-managed (src/data/myf.ts), else its title. */
function festivalTab(eventId: string | undefined, eventTitle: string): string {
  const seed = eventId
    ? SEEDED_FESTIVAL_EVENTS.find((s) => s.programId === eventId)
    : undefined;
  return tabTitle(seed?.sheetTab || eventTitle);
}

/** Tabs verified this server instance (header present, dropdown set). */
const decoratedTabs = new Set<string>();

/**
 * Self-healing formatting for an event's registrations tab: make sure
 * row 1 holds the header (inserting it above existing rows when it's
 * missing), freeze and bold it, and (re)apply the Follow-up dropdown to
 * column G. Runs once per tab per server instance; never throws.
 */
async function decorateFestivalTab(spreadsheetId: string, tab: string): Promise<void> {
  const key = `${spreadsheetId}/${tab}`;
  if (decoratedTabs.has(key)) return;
  try {
    const cfg = sheetsConfig();
    if (!cfg) return;
    const token = await accessToken(cfg);
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    // batchUpdate addresses tabs by numeric id, not title
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`,
      { headers },
    );
    if (!metaRes.ok) return;
    const meta = (await metaRes.json()) as {
      sheets?: { properties: { sheetId: number; title: string } }[];
    };
    const gid = meta.sheets?.find((s) => s.properties.title === tab)?.properties.sheetId;
    if (gid == null) return;

    const range = encodeURIComponent(`'${tab.replace(/'/g, "''")}'!A1:A1`);
    const rowRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      { headers },
    );
    if (!rowRes.ok) return;
    const rowData = (await rowRes.json()) as { values?: string[][] };
    const hasHeader = (rowData.values?.[0]?.[0] ?? "") === FESTIVAL_HEADER[0];

    const requests: unknown[] = [];
    if (!hasHeader) {
      // Push existing rows down before writing the header into row 1
      requests.push({
        insertDimension: {
          range: { sheetId: gid, dimension: "ROWS", startIndex: 0, endIndex: 1 },
          inheritFromBefore: false,
        },
      });
    }
    // (Re)write the header row every time — upgrades tabs created before
    // new columns existed. Row 1 is always the header by this point.
    requests.push({
      updateCells: {
        start: { sheetId: gid, rowIndex: 0, columnIndex: 0 },
        rows: [
          { values: FESTIVAL_HEADER.map((h) => ({ userEnteredValue: { stringValue: h } })) },
        ],
        fields: "userEnteredValue",
      },
    });
    // Clear any stale dropdown wherever it used to live (the Follow-up
    // column moves when columns are added or removed), then re-apply it
    // on the current column below.
    requests.push({
      setDataValidation: {
        range: { sheetId: gid, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 26 },
      },
    });
    requests.push({
      updateSheetProperties: {
        properties: { sheetId: gid, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    });
    requests.push({
      repeatCell: {
        range: { sheetId: gid, startRowIndex: 0, endRowIndex: 1 },
        cell: { userEnteredFormat: { textFormat: { bold: true } } },
        fields: "userEnteredFormat.textFormat.bold",
      },
    });
    // Dropdown chips on every Follow-up cell below the header. strict is
    // off so a hand-typed note doesn't get rejected.
    requests.push({
      setDataValidation: {
        range: {
          sheetId: gid,
          startRowIndex: 1,
          startColumnIndex: FOLLOWUP_COLUMN,
          endColumnIndex: FOLLOWUP_COLUMN + 1,
        },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: FOLLOWUP_OPTIONS.map((v) => ({ userEnteredValue: v })),
          },
          showCustomUi: true,
          strict: false,
        },
      },
    });

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      { method: "POST", headers, body: JSON.stringify({ requests }) },
    );
    if (!res.ok) {
      console.error(`Google Sheets decorate of "${tab}" failed:`, res.status, await res.text());
      return; // left uncached so the next append retries
    }
    decoratedTabs.add(key);
  } catch (error) {
    console.error(`Google Sheets decorate of "${tab}" error:`, error);
  }
}

/**
 * Make sure an event's registrations tab is set up (header row, frozen
 * bold header, Follow-up dropdown) without appending anything — used by
 * repeat registrations, which don't add a row. Never throws.
 */
export async function ensureFestivalSheetSetup(
  eventId: string | undefined,
  eventTitle: string,
): Promise<void> {
  const cfg = sheetsConfig();
  if (!cfg) return;
  await decorateFestivalTab(festivalSheetId(cfg), festivalTab(eventId, eventTitle));
}

/* ------------------------------------------------------------------ */
/*  Row removal — spam cleanup keeps the sheet in step with the DB     */
/* ------------------------------------------------------------------ */

/**
 * Delete every row of a tab the matcher flags (bottom-up, one batch).
 * Targets a tab by exact title, or the spreadsheet's first tab.
 * Never throws; returns how many rows were removed.
 */
async function deleteRowsWhere(
  spreadsheetId: string,
  tab: { title: string } | { first: true },
  match: (row: string[], rowIndex: number) => boolean,
): Promise<number> {
  try {
    const cfg = sheetsConfig();
    if (!cfg) return 0;
    const token = await accessToken(cfg);
    if (!token) return 0;
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title,index)`,
      { headers },
    );
    if (!metaRes.ok) return 0;
    const meta = (await metaRes.json()) as {
      sheets?: { properties: { sheetId: number; title: string; index: number } }[];
    };
    const sheets = meta.sheets ?? [];
    const target =
      "title" in tab
        ? sheets.find((s) => s.properties.title === tab.title)
        : sheets.slice().sort((a, b) => a.properties.index - b.properties.index)[0];
    if (!target) return 0;

    const range = encodeURIComponent(`'${target.properties.title.replace(/'/g, "''")}'!A1:Z`);
    const valRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      { headers },
    );
    if (!valRes.ok) return 0;
    const rows = (((await valRes.json()) as { values?: string[][] }).values ?? []);

    const doomed: number[] = [];
    rows.forEach((row, i) => {
      if (match(row, i)) doomed.push(i);
    });
    if (doomed.length === 0) return 0;

    // Bottom-up so earlier deletions don't shift later indexes
    const requests = doomed
      .sort((a, b) => b - a)
      .map((i) => ({
        deleteDimension: {
          range: { sheetId: target.properties.sheetId, dimension: "ROWS", startIndex: i, endIndex: i + 1 },
        },
      }));
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      { method: "POST", headers, body: JSON.stringify({ requests }) },
    );
    if (!res.ok) {
      console.error("Google Sheets row delete failed:", res.status, await res.text());
      return 0;
    }
    return doomed.length;
  } catch (error) {
    console.error("Google Sheets row delete error:", error);
    return 0;
  }
}

/**
 * Remove an event tab's registration rows for the given emails
 * (column C). The header row is never touched. Never throws.
 */
export async function removeFestivalSheetRows(
  eventId: string | undefined,
  eventTitle: string,
  emails: string[],
): Promise<number> {
  const cfg = sheetsConfig();
  if (!cfg || emails.length === 0) return 0;
  const wanted = new Set(emails.map((e) => e.trim().toLowerCase()));
  return deleteRowsWhere(
    festivalSheetId(cfg),
    { title: festivalTab(eventId, eventTitle) },
    (row, i) => {
      if (i === 0 && String(row[0] ?? "") === FESTIVAL_HEADER[0]) return false;
      return wanted.has(String(row[2] ?? "").trim().toLowerCase());
    },
  );
}

/**
 * Remove weekly-program registration rows for one program + emails from
 * the programs spreadsheet's first tab. Rows there are
 * Registered At · Program · Full Name · Email · Mobile · Heard Via.
 * Never throws.
 */
export async function removeWeeklySheetRows(
  programTitle: string,
  emails: string[],
): Promise<number> {
  const cfg = sheetsConfig();
  if (!cfg || emails.length === 0) return 0;
  const sheetId = process.env.GOOGLE_SHEETS_PROGRAMS_ID || DEFAULT_PROGRAMS_SHEET_ID;
  const wanted = new Set(emails.map((e) => e.trim().toLowerCase()));
  return deleteRowsWhere(
    sheetId,
    { first: true },
    (row) =>
      String(row[1] ?? "").trim() === programTitle &&
      wanted.has(String(row[3] ?? "").trim().toLowerCase()),
  );
}

/**
 * One row per festival/event registration, for door check-in.
 * Lands in the SAME spreadsheet as the Bhajan Clubbing registrations
 * (GOOGLE_SHEETS_ID / its default), on the event's tab (the seed's
 * sheetTab, else the event title) — created with a header row the first
 * time someone registers.
 * GOOGLE_SHEETS_FESTIVALS_ID still overrides the spreadsheet if set.
 * Columns: Registered At (ET) · Full Name · Email · Mobile · WhatsApp ·
 * Location · University / Company · Heard Via · Follow-up (dropdown,
 * starts as "Registered")
 */
export async function appendFestivalRegistrationToSheet(r: FestivalRow): Promise<boolean> {
  const cfg = sheetsConfig();
  if (!cfg) return false;
  const sheetId = festivalSheetId(cfg);
  const tab = festivalTab(r.eventId, r.event);
  const registeredAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  const ok = await appendToTabEnsuring(sheetId, tab, FESTIVAL_HEADER, [
    registeredAt,
    r.name,
    r.email,
    r.phone,
    r.whatsapp || "",
    r.location || "",
    r.organization || "",
    r.hearAbout || "",
    FOLLOWUP_OPTIONS[0],
  ]);
  if (ok) await decorateFestivalTab(sheetId, tab);
  return ok;
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

/** Exact tab name — the organizers renamed the original "reviews" tab. */
const REVIEWS_TAB = "Bhajan Clubbing Aug 2026 Reviews";
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
  // Quoted A1 notation so tab names with spaces ("Prerana Festival") work
  const range = encodeURIComponent(`'${tab.replace(/'/g, "''")}'!A1`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    },
  );
  if (!res.ok) {
    // Expected once per spreadsheet+tab: the tab doesn't exist yet
    console.error(`Google Sheets append to "${tab}" failed:`, res.status, await res.text());
    return false;
  }
  return true;
}

/** Create a tab with a header row. Tolerates "already exists". */
async function createTab(
  sheetId: string,
  token: string,
  tab: string,
  header: string[],
): Promise<boolean> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
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
  await appendToTab(sheetId, token, tab, header);
  return true;
}

/**
 * Append one row to a named tab, creating the tab (with its header row)
 * on first use. Never throws.
 */
async function appendToTabEnsuring(
  sheetId: string,
  tab: string,
  header: string[],
  values: (string | number)[],
): Promise<boolean> {
  try {
    const cfg = sheetsConfig();
    if (!cfg) return false;
    const token = await accessToken(cfg);
    if (!token) return false;
    if (await appendToTab(sheetId, token, tab, values)) return true;
    // Most likely the tab doesn't exist yet — create it and retry once.
    if (!(await createTab(sheetId, token, tab, header))) return false;
    return appendToTab(sheetId, token, tab, values);
  } catch (error) {
    console.error(`Google Sheets append to "${tab}" error:`, error);
    return false;
  }
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
  const cfg = sheetsConfig();
  if (!cfg) return false;
  const submittedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  return appendToTabEnsuring(cfg.sheetId, REVIEWS_TAB, REVIEWS_HEADER, [
    submittedAt,
    r.name,
    r.rating,
    r.enjoyed,
    r.programsInterest,
    r.programs,
    r.inspire,
    r.suggestions,
  ]);
}
