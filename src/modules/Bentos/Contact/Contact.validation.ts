import { z } from "zod";

import type { UserContactData } from "./Contact.types.ts";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  reason: z.string().min(2, "Please tell me a bit more."),
  phone: z
    .string()
    .regex(
      /^(\+?\d{1,3}[-.\s]?)?\(?[\d\s]{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/,
      "Please provide a valid phone number.",
    ),
  email: z.string().email("Please provide a valid email address."),
}) satisfies z.ZodType<UserContactData>;

// Single source of truth: field name + question text + Zod validator (via schema.shape)
export const STEPS = [
  {
    field: "name" as const,
    question: "What is your name?",
  },
  {
    field: "reason" as const,
    question: [
      "Nice to meet you 👋",
      "So what did you want to talk about?",
    ] as const,
  },
  {
    field: "phone" as const,
    question: ["Ahh I see 👀", "What is your phone number? 📱"] as const,
  },
  {
    field: "email" as const,
    question: "What is your email address? 📧",
  },
] satisfies readonly {
  field: keyof UserContactData;
  question: string | readonly string[];
}[];

export function validateStep(step: number, value: string): string | null {
  const s = STEPS[step];
  if (!s) {
    return null;
  }
  const result = contactSchema.shape[s.field].safeParse(value);
  if (result.success) {
    return null;
  }
  /* istanbul ignore next — a failed parse always yields ≥1 issue, so the ?? fallback is unreachable */
  return result.error.issues[0]?.message ?? "Invalid input.";
}

export function hasEnoughText(text: string): boolean {
  return text.trim().length >= 2;
}
