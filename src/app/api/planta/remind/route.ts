import { NextResponse } from "next/server";

import type { DuePlant } from "@/lib/notifications/index.ts";

import { notifyPlantSummary } from "@/lib/notifications/index.ts";
import { getPlantaCardStatuses } from "@/lib/plants/plantCardFormat.ts";
import { actionLabels } from "@/lib/plants/selectors.ts";
import { getPlantaPlantsResult } from "@/vendors/planta/service.ts";

export const runtime = "nodejs";

// Public endpoint: cap pushes to Rik's phone, however often visitors click.
// shortcut: per-instance memory resets on cold start / across instances; move to a Vercel Firewall rate-limit rule if spam gets through.
const COOLDOWN_MS = 30 * 60 * 1000;
let lastSentAt = 0;

/**
 * Owner reminder: derive every plant that's due right now (server-side, never
 * trusting the client) and push a single summary to Rik's phone.
 */
export async function POST() {
  if (Date.now() - lastSentAt < COOLDOWN_MS) {
    return NextResponse.json({ ok: true, throttled: true });
  }
  lastSentAt = Date.now();

  const result = await getPlantaPlantsResult();
  if (!result.ok) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  const duePlants = result.data.plantCards
    .map((card): DuePlant => {
      const actions = getPlantaCardStatuses(card)
        .filter((status) => status.state === "due")
        .map((status) =>
          (status.actionType
            ? actionLabels[status.actionType]
            : "Care"
          ).toLowerCase(),
        );

      return { name: card.name, actions };
    })
    .filter((plant) => plant.actions.length > 0);

  const sent = await notifyPlantSummary(duePlants, new Date().toISOString());

  if (!sent.ok && !sent.skipped) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true, count: duePlants.length });
}
