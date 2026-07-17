"use server";

import type { UserContactData } from "./Contact.types.ts";

import { notifyContactSubmission } from "@/lib/notifications/index.ts";

import { contactSchema } from "./Contact.validation.ts";

export async function submitContact(
  data: UserContactData,
): Promise<{ ok: boolean }> {
  const result = contactSchema.safeParse(data);
  if (!result.success) {
    return { ok: false };
  }

  // Best-effort: a WhatsApp hiccup must never make the form look broken to the
  // visitor, so failures are logged and we still report success.
  try {
    const sent = await notifyContactSubmission(
      result.data,
      new Date().toISOString(),
    );

    if (!sent.ok && !sent.skipped) {
      console.error("Contact WhatsApp send failed:", sent.error);
    }
  } catch (error) {
    console.error("Contact submission notification failed:", error);
  }

  return { ok: true };
}
