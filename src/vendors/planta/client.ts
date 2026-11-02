import "server-only";

import type { PlantaPlant, PlantaTokenSet } from "./types.ts";

import { env } from "@env";

import { isAccessTokenValid } from "./auth.ts";
import { getPlantaTokens, setPlantaTokens } from "./tokenStore.ts";

const API_V1_ENDPOINT = "https://public.planta-api.com/v1";

const DEFAULT_RATE_LIMIT_RETRY_DELAY_MS = 1000 as const;

interface RequestOptions {
  readonly json?: Record<string, unknown>;
  readonly retryAttempt?: number;
}

interface PlantaResponse<TData> {
  readonly data?: TData;
  readonly message?: string;
  readonly errorType?: string;
  readonly status?: number;
}

export class PlantaError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "PlantaError";
  }
}

export class PlantaUnauthorizedError extends PlantaError {
  public constructor(message: string) {
    super(message);
    this.name = "PlantaUnauthorizedError";
  }
}

interface PlantaClientOptions {
  readonly tokens?: PlantaTokenSet;
  readonly authCode?: string;
  readonly onTokensChanged?: (tokens: PlantaTokenSet) => void;
}

export class PlantaClient {
  private tokens: PlantaTokenSet | null;
  private readonly authCode?: string;
  private readonly onTokensChanged?: (tokens: PlantaTokenSet) => void;

  public constructor(options: PlantaClientOptions) {
    this.tokens = options.tokens ?? null;
    this.authCode = options.authCode;
    this.onTokensChanged = options.onTokensChanged;
  }

  private setTokens(tokens: PlantaTokenSet): void {
    this.tokens = tokens;
    this.onTokensChanged?.(tokens);
  }

  /** First page of the user's plants (the dashboard only shows a handful). */
  public async getPlants(): Promise<readonly PlantaPlant[]> {
    const result = await this.request<PlantaPlant[]>("GET", "/addedPlants");
    return result.data ?? [];
  }

  private async ensureAuthorized(): Promise<void> {
    if (!this.isAccessTokenValid()) {
      await this.reauthorize();
    }
  }

  /** Refresh token first; fall back to the one-time auth code if refresh is rejected. */
  private async reauthorize(): Promise<void> {
    if (this.tokens?.refreshToken) {
      try {
        await this.refreshTokens();
        return;
      } catch (error) {
        if (!(error instanceof PlantaUnauthorizedError) || !this.authCode) {
          throw error;
        }
      }
    }

    if (this.authCode) {
      await this.authorize(this.authCode);
      return;
    }

    throw new PlantaUnauthorizedError(
      "Missing Planta credentials. Set PLANTA_REFRESH_TOKEN or PLANTA_AUTH_CODE.",
    );
  }

  private async authorize(code: string): Promise<void> {
    const result = await this.request<PlantaTokenSet>(
      "POST",
      "/auth/authorize",
      {
        json: { code },
      },
      false,
      false,
    );

    if (!result.data?.accessToken) {
      throw new PlantaUnauthorizedError(
        "Planta authorize did not return accessToken.",
      );
    }

    this.setTokens({
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      tokenType: result.data.tokenType ?? "Bearer",
    });
  }

  private async refreshTokens(): Promise<void> {
    /* istanbul ignore next — callers always check tokens?.refreshToken before calling */
    if (!this.tokens?.refreshToken) {
      throw new PlantaUnauthorizedError("Planta refresh token is missing.");
    }

    const result = await this.request<PlantaTokenSet>(
      "POST",
      "/auth/refreshToken",
      {
        json: { refreshToken: this.tokens.refreshToken },
      },
      false,
      false,
    );

    if (!result.data?.accessToken) {
      throw new PlantaUnauthorizedError(
        "Planta refresh did not return accessToken.",
      );
    }

    this.setTokens({
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken ?? this.tokens.refreshToken,
      tokenType: result.data.tokenType ?? this.tokens.tokenType ?? "Bearer",
    });
  }

  private isAccessTokenValid(): boolean {
    return isAccessTokenValid(this.tokens?.accessToken);
  }

  private async request<TData>(
    method: "GET" | "POST",
    path: string,
    options?: RequestOptions,
    requireAuth = true,
    retryOnUnauthorized = true,
  ): Promise<PlantaResponse<TData>> {
    if (requireAuth) {
      await this.ensureAuthorized();
    }

    const headers = new Headers();
    headers.set("Accept", "application/json");

    if (options?.json) {
      headers.set("Content-Type", "application/json");
    }

    if (this.tokens?.accessToken) {
      headers.set(
        "Authorization",
        `${this.tokens.tokenType ?? "Bearer"} ${this.tokens.accessToken}`,
      );
    }

    let response: Response;

    try {
      response = await fetch(`${API_V1_ENDPOINT}${path}`, {
        method,
        headers,
        body: options?.json ? JSON.stringify(options.json) : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new PlantaError("Planta request timed out.");
      }

      const message =
        error instanceof Error
          ? error.message
          : "Planta network request failed.";

      throw new PlantaError(message);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? ((await response.json()) as PlantaResponse<TData>)
      : ({ message: await response.text() } as PlantaResponse<TData>);

    if (!response.ok) {
      const message = payload.message ?? `HTTP ${response.status}`;
      const errorType = payload.errorType ?? "unknown";

      if (response.status === 429 || errorType === "rate_limit") {
        const retryAttempt = options?.retryAttempt ?? 0;

        if (retryAttempt < 1) {
          const retryAfterHeader = response.headers.get("retry-after");
          const retryDelayMs = retryAfterHeader
            ? Math.max(0, Number(retryAfterHeader) * 1000)
            : DEFAULT_RATE_LIMIT_RETRY_DELAY_MS;

          await new Promise((resolve) => {
            setTimeout(resolve, retryDelayMs);
          });

          return this.request(
            method,
            path,
            {
              ...options,
              retryAttempt: retryAttempt + 1,
            },
            requireAuth,
            retryOnUnauthorized,
          );
        }
      }

      if (response.status === 401 || errorType === "unauthorized") {
        if (!retryOnUnauthorized) {
          throw new PlantaUnauthorizedError(message);
        }

        await this.reauthorize();
        return this.request(method, path, options, requireAuth, false);
      }

      throw new PlantaError(`${errorType}: ${message}`);
    }

    return { ...payload, status: response.status };
  }
}

export const createPlantaClientFromEnv = (): PlantaClient => {
  return new PlantaClient({
    tokens: getPlantaTokens() ?? undefined,
    authCode: env.PLANTA_AUTH_CODE,
    onTokensChanged: setPlantaTokens,
  });
};
