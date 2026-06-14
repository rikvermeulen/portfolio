import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import {
  fetchSavedPicnicRecipes,
  toPicnicErrorMessage,
} from "@/lib/picnic/service.ts";

export async function GET(request: NextRequest) {
  try {
    const includeNodeId = request.nextUrl.searchParams.get("includeNodeId");
    const { rawRecipes, recipeCards, authKey } = await fetchSavedPicnicRecipes({
      includeNodeId: includeNodeId ?? undefined,
    });
    const shouldReturnRaw = request.nextUrl.searchParams.get("raw") === "1";

    return NextResponse.json(
      shouldReturnRaw
        ? { recipes: rawRecipes, authKey: authKey ?? undefined }
        : { recipes: recipeCards, authKey: authKey ?? undefined },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: toPicnicErrorMessage(error) },
      { status: 500 },
    );
  }
}
