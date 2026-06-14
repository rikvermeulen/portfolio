import { NextResponse } from "next/server";

import { getFindMeConditionsResult } from "@/lib/findMeConditions/service.ts";

export async function GET() {
  const result = await getFindMeConditionsResult();

  if (!result.ok) {
    return NextResponse.json(result, {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
