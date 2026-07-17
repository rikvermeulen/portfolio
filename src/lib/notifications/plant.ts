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
