import type { NtfySendResult } from "@/vendors/ntfy/index.ts";

import { sendNotification } from "@/vendors/ntfy/index.ts";

/**
 * Notifies Rik that a visitor poked a plant needing care. `action` is a lower
 * case verb ("water" / "mist"); `now` is passed in for testability.
 */
export const notifyPlantNudge = (
  plantName: string,
  action: string,
  now: string,
): Promise<NtfySendResult> =>
  sendNotification(
    `🌱 ${plantName} needs ${action}.\nPoked by a visitor · ${now}`,
    "Plant care",
  );

/** One plant that currently needs care, with its due actions ("water", "mist"). */
export interface DuePlant {
  readonly name: string;
  readonly actions: readonly string[];
}

/**
 * Notifies Rik that a visitor flagged his plants, summarising everything due
 * right now in a single push. An empty list still sends — reassurance that
 * nothing is overdue. `now` is passed in for testability.
 */
export const notifyPlantSummary = (
  plants: readonly DuePlant[],
  now: string,
): Promise<NtfySendResult> => {
  if (plants.length === 0) {
    return sendNotification(
      `🌿 A visitor checked in — all your plants look happy.\nPoked by a visitor · ${now}`,
      "Plant care",
    );
  }

  const lines = plants.map(
    (plant) => `• ${plant.name} — ${plant.actions.join(", ")}`,
  );
  const heading =
    plants.length === 1
      ? "1 plant needs attention"
      : `${plants.length} plants need attention`;

  return sendNotification(
    `🌱 ${heading}:\n${lines.join("\n")}\nPoked by a visitor · ${now}`,
    "Plant care",
  );
};
