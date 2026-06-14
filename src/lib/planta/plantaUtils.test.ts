import {
  decodeJwtPayload,
  getDaysUntilIsoDate,
  getTokenExpiryMs,
  isAccessTokenValid,
} from "./plantaUtils.ts";

const toBase64Url = (value: string): string => {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const createUnsignedJwt = (payload: Record<string, unknown>): string => {
  const header = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify(payload));
  return `${header}.${body}.`;
};

describe("planta utils", () => {
  it("decodes jwt payloads", () => {
    const token = createUnsignedJwt({ exp: 123 });
    expect(decodeJwtPayload(token)).toEqual({ exp: 123 });
  });

  it("returns token expiry in ms", () => {
    const token = createUnsignedJwt({ exp: 123 });
    expect(getTokenExpiryMs(token)).toBe(123_000);
  });

  it("checks access token validity with safety window", () => {
    const nowMs = 1_000_000;
    const validToken = createUnsignedJwt({
      exp: Math.floor((nowMs + 60_000) / 1000),
    });
    const expiringToken = createUnsignedJwt({
      exp: Math.floor((nowMs + 20_000) / 1000),
    });

    expect(isAccessTokenValid(validToken, nowMs, 30_000)).toBe(true);
    expect(isAccessTokenValid(expiringToken, nowMs, 30_000)).toBe(false);
  });

  it("returns day delta for iso dates", () => {
    const nowMs = Date.parse("2026-03-22T00:00:00.000Z");
    expect(getDaysUntilIsoDate("2026-03-24T00:00:00.000Z", nowMs)).toBe(2);
    expect(getDaysUntilIsoDate("not-a-date", nowMs)).toBeNull();
  });

  it("decodeJwtPayload returns null for a token with no payload segment", () => {
    expect(decodeJwtPayload("onlyone")).toBeNull();
  });

  it("decodeJwtPayload returns null when the payload is not valid JSON", () => {
    // Encode something that isn't JSON
    const header = toBase64Url("{}");
    const badPayload = toBase64Url("not-json!!!");
    expect(decodeJwtPayload(`${header}.${badPayload}.`)).toBeNull();
  });

  it("getTokenExpiryMs returns null when the token has no exp claim", () => {
    const token = createUnsignedJwt({ sub: "user-1" });
    expect(getTokenExpiryMs(token)).toBeNull();
  });

  it("isAccessTokenValid returns false for an undefined token", () => {
    expect(isAccessTokenValid(undefined)).toBe(false);
  });

  it("isAccessTokenValid returns false when the token carries no exp claim", () => {
    const token = createUnsignedJwt({ sub: "user-1" });
    expect(isAccessTokenValid(token, 1_000_000, 30_000)).toBe(false);
  });
});
