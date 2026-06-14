interface TokenPayload {
  readonly exp?: number;
}

export const decodeJwtPayload = (token: string): TokenPayload | null => {
  const [, rawPayload] = token.split(".");

  if (!rawPayload) {
    return null;
  }

  const normalized = rawPayload.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = normalized.length % 4;
  const padded =
    remainder > 0
      ? normalized.padEnd(normalized.length + (4 - remainder), "=")
      : normalized;

  try {
    const decoded = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
};

export const getTokenExpiryMs = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return null;
  }

  return payload.exp * 1000;
};

export const isAccessTokenValid = (
  token: string | undefined,
  nowMs = Date.now(),
  safetyWindowMs = 30_000,
): boolean => {
  if (!token) {
    return false;
  }

  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) {
    return false;
  }

  return expiryMs > nowMs + safetyWindowMs;
};

export const getDaysUntilIsoDate = (
  dateIso: string,
  nowMs = Date.now(),
): number | null => {
  const dateMs = Date.parse(dateIso);
  if (Number.isNaN(dateMs)) {
    return null;
  }

  return Math.floor((dateMs - nowMs) / 86_400_000);
};
