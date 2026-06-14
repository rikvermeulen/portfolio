"use server";

import type { UserContactData } from "./Contact.types.ts";

import { contactSchema } from "./Contact.validation.ts";

export async function submitContact(
  data: UserContactData,
): Promise<{ ok: boolean }> {
  const result = contactSchema.safeParse(data);
  if (!result.success) {
    return { ok: false };
  }

  // TODO: wire up an email transport (e.g. Resend) to deliver submissions
  console.info("Contact submission:", result.data);

  return { ok: true };
}
