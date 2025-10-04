import { RecommendationTemplate } from "@/components/EmailTemplate.tsx";
import { env } from "@/env.ts";
import { Resend } from "resend";
import { NextResponse } from "next/server";

import type { ReactElement } from "react";

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, recommendation } = await request.json();

  try {
    const data = await resend.emails.send({
      from: "Rik Vermeulen <info@rikvermeulen.com>",
      to: ["rik.vermeulen.1997@live.nl"],
      subject: "Recommendation form submission: rikvermeulen.com",
      react: RecommendationTemplate({
        email: email,
        recommendation: recommendation,
      }) as ReactElement,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
