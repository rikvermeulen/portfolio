import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  reason: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid contact data", issues: result.error.issues },
      { status: 422 },
    );
  }

  // TODO: wire up an email transport (e.g. Resend, Nodemailer) to deliver submissions
  console.info("Contact form submission:", result.data);

  return NextResponse.json({ ok: true }, { status: 200 });
}
