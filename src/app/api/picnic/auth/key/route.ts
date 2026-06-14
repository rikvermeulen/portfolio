import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import {
  fetchPicnicAuthKey,
  toPicnicErrorMessage,
} from "@/lib/picnic/service.ts";
import { env } from "@env";

const ADMIN_HEADER = "x-picnic-admin-secret";

const sha256 = (value: string): string =>
  createHash("sha256").update(value, "utf-8").digest("hex");

const isSecretValid = (providedSecret: string): boolean => {
  const expectedHash = sha256(env.PICNIC_AUTH_ADMIN_SECRET ?? "");
  const providedHash = sha256(providedSecret);

  return timingSafeEqual(
    Buffer.from(expectedHash, "utf-8"),
    Buffer.from(providedHash, "utf-8"),
  );
};

export async function POST(request: NextRequest) {
  if (env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!env.PICNIC_AUTH_ADMIN_SECRET) {
    return NextResponse.json(
      { error: "Missing PICNIC_AUTH_ADMIN_SECRET in server env." },
      { status: 500 },
    );
  }

  const providedSecret = request.headers.get(ADMIN_HEADER);
  if (!providedSecret || !isSecretValid(providedSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const authKey = await fetchPicnicAuthKey();

    return NextResponse.json(
      {
        authKey,
        note: "Store this value in PICNIC_AUTH_KEY and remove PICNIC_PASSWORD afterwards.",
      },
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
