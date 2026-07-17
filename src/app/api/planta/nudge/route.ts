import { NextResponse } from "next/server";
import { z } from "zod";

import type { NextRequest } from "next/server";

import { notifyPlantNudge } from "@/lib/notifications/index.ts";
import { getPlantaCardStatuses } from "@/lib/plants/plantCardFormat.ts";
import { actionLabels } from "@/lib/plants/selectors.ts";
import { getPlantaPlantsResult } from "@/vendors/planta/service.ts";

export const runtime = "nodejs";

const nudgeSchema = z.object({
  plantId: z.string().min(1),
  website: z.string().optional(), // honeypot — real users never fill this
});

export async function POST(request: NextRequest) {
  const body = nudgeSchema.safeParse(await request.json().catch(() => null));

  // Bad input or a tripped honeypot → look like success, drop silently.
  if (!body.success || body.data.website) {
    return NextResponse.json({ ok: true });
  }

  const result = await getPlantaPlantsResult();
  if (!result.ok) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  // Re-derive "due" server-side — never trust the client that a plant needs care.
  const card = result.data.plantCards.find((c) => c.id === body.data.plantId);
  const due = card
    ? getPlantaCardStatuses(card).find((status) => status.state === "due")
    : undefined;

  if (!card || !due) {
    return NextResponse.json({ ok: false }, { status: 409 });
  }

  const action = (
    due.actionType ? actionLabels[due.actionType] : "care"
  ).toLowerCase();
  const sent = await notifyPlantNudge(
    card.name,
    action,
    new Date().toISOString(),
  );

  if (!sent.ok && !sent.skipped) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
