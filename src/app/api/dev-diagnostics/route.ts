import { appendFile } from "node:fs/promises";

import { NextResponse } from "next/server";

/**
 * Sink for client-side Spotify diagnostics (see `reportDiagnostic` in
 * src/lib/spotify/webPlayback.ts). Appends JSON lines to a local log file so
 * playback failures in a real browser can be inspected from the terminal.
 * Active in every build; clients only send events when the page is loaded
 * with `?spotify-diag`.
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const line = JSON.stringify({ t: new Date().toISOString(), ...payload });
    await appendFile(".spotify-diag.log", `${line}\n`);
  } catch {
    // Malformed payloads or read-only filesystems (some hosts) are ignored —
    // diagnostics must never break the app.
  }
  return NextResponse.json({ ok: true });
}
