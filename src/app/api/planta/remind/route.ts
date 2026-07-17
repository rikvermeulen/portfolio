import { NextResponse } from "next/server";

import type { DuePlant } from "@/lib/notifications/index.ts";

import { notifyPlantSummary } from "@/lib/notifications/index.ts";
import { getPlantaCardStatuses } from "@/lib/plants/plantCardFormat.ts";
import { actionLabels } from "@/lib/plants/selectors.ts";
import { getPlantaPlantsResult } from "@/vendors/planta/service.ts";

export const runtime = "nodejs";

/**
 * Owner reminder: derive every plant that's due right now (server-side, never
 * trusting the client) and push a single summary to Rik's phone.
 */
export async function POST() {
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
