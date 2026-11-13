"use server";

import { notifyPlantSummary } from "@/lib/notifications/index.ts";
import { getDuePlants } from "@/lib/plants/plantCardFormat.ts";
import { getPlantaPlantsResult } from "@/vendors/planta/service.ts";

// Public action: cap pushes to Rik's phone, however often visitors click.
// shortcut: per-instance memory resets on cold start / across instances; move to a Vercel Firewall rate-limit rule if spam gets through.
const COOLDOWN_MS = 30 * 60 * 1000;
let lastSentAt = 0;

/**
 * Owner reminder: derive every plant that's due right now (server-side, never
 * trusting the client) and push a single summary to Rik's phone.
 */
export async function remindMe(): Promise<{ ok: boolean }> {
  if (Date.now() - lastSentAt < COOLDOWN_MS) {
    return { ok: true };
  }
  // Claim the slot now so concurrent clicks are throttled; release it on failure.
  const previousSentAt = lastSentAt;
  lastSentAt = Date.now();

  const result = await getPlantaPlantsResult();
  const sent = result.ok
    ? await notifyPlantSummary(
        getDuePlants(result.data.plantCards),
        new Date().toISOString(),
      )
    : null;

  if (!sent || (!sent.ok && !sent.skipped)) {
    lastSentAt = previousSentAt;
    return { ok: false };
  }

  return { ok: true };
}
