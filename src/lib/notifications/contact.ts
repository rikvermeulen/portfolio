import type { ContactNotification } from "./types.ts";
import type { NtfySendResult } from "@/vendors/ntfy/index.ts";

import { sendNotification } from "@/vendors/ntfy/index.ts";

/**
 * Notifies Rik of a new contact submission. `now` is passed in (not read from
 * the clock) so the caller controls the timestamp and this stays testable.
 */
export const notifyContactSubmission = (
  data: ContactNotification,
  now: string,
): Promise<NtfySendResult> =>
  sendNotification(
    [
      `From: ${data.name}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email}`,
      `Message: ${data.reason}`,
      `Sent: ${now}`,
    ].join("\n"),
    "New contact request",
  );
