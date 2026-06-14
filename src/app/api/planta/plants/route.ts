import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { getPlantaPlantsResult } from "@/lib/planta/service.ts";

export async function GET(request: NextRequest) {
  const shouldReturnRaw = request.nextUrl.searchParams.get("raw") === "1";
  const result = await getPlantaPlantsResult();

  if (!result.ok) {
    return NextResponse.json(
      { error: result.errorMessage },
      { status: result.statusCode },
    );
  }

  return NextResponse.json(
    shouldReturnRaw
      ? { plants: result.data.rawPlants }
      : { plants: result.data.plantCards },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
