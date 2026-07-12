import { appendFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { NextResponse } from "next/server";

import { env } from "@env";

/**
 * Sink for client-side Spotify diagnostics (see `reportDiagnostic` in
 * src/lib/spotify/webPlayback.ts). Appends JSON lines to a log file so
 * playback failures in a real browser can be inspected from the terminal.
 *
 * The log lives in the OS temp dir (`spotify-diag.log`), NOT the project root:
 * writing into the watched source tree makes every diagnostic POST fire the
 * dev-server file watcher, which retriggers a Turbopack recompile — a runaway
 * loop when playback keeps failing (e.g. the DRM-less in-app preview browser).
 *
 * Dev-only: clients send events when the page is loaded with `?spotify-diag`.
 */
const DIAG_LOG = join(tmpdir(), "spotify-diag.log");

export async function POST(request: Request) {
  if (env.NODE_ENV !== "development") {
    return NextResponse.json({ ok: true });
  }
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const line = JSON.stringify({ t: new Date().toISOString(), ...payload });
    await appendFile(DIAG_LOG, `${line}\n`);
  } catch {
    // Malformed payloads or read-only filesystems (some hosts) are ignored —
    // diagnostics must never break the app.
  }
  return NextResponse.json({ ok: true });
}
