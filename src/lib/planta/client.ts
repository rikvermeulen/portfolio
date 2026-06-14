import "server-only";

import type {
  PlantaPaginatedResponse,
  PlantaPlant,
  PlantaTokenSet,
} from "./types.ts";

import { env } from "@env";

import { isAccessTokenValid } from "./plantaUtils.ts";

const API_V1_ENDPOINT = "https://public.planta-api.com/v1";

/** Prevents infinite pagination if the API repeats cursors. */
const MAX_PLANT_PAGES = 50 as const;
const DEFAULT_RATE_LIMIT_RETRY_DELAY_MS = 1000 as const;

interface RequestOptions {
  readonly params?: Record<string, string>;
  readonly json?: Record<string, unknown>;
  readonly retryAttempt?: number;
}

interface PlantaResponse<TData> {
  readonly data?: TData;
  readonly message?: string;
  readonly errorType?: string;
  readonly pagination?: {
    readonly nextPage?: string | null;
  };
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
}

export class PlantaClient {
  private tokens: PlantaTokenSet | null;
  private readonly authCode?: string;

  public constructor(options: PlantaClientOptions) {
    this.tokens = options.tokens ?? null;
    this.authCode = options.authCode;
  }

  public async getPlants(options?: {
    readonly cursor?: string;
    readonly fetchAll?: boolean;
    readonly maxPlants?: number;
  }): Promise<PlantaPaginatedResponse> {
    let cursor = options?.cursor ?? null;
    const fetchAll = options?.fetchAll ?? true;
    const maxPlants =
      options?.maxPlants && options.maxPlants > 0
        ? Math.floor(options.maxPlants)
        : null;
    const plants: PlantaPlant[] = [];
    let pageCount = 0;

    while (true) {
      pageCount += 1;

      if (pageCount > MAX_PLANT_PAGES) {
        break;
      }

      const result = await this.request<PlantaPlant[]>("GET", "/addedPlants", {
        params: cursor ? { cursor } : undefined,
      });
      const pagePlants = result.data ?? [];

      if (maxPlants !== null) {
        const remaining = maxPlants - plants.length;
        if (remaining > 0) {
          plants.push(...pagePlants.slice(0, remaining));
        }
      } else {
        plants.push(...pagePlants);
      }

      const nextPage = result.pagination?.nextPage ?? null;
      const reachedMaxPlants = maxPlants !== null && plants.length >= maxPlants;

      if (reachedMaxPlants || !fetchAll || !nextPage) {
        return { plants, cursor: nextPage };
      }

      if (nextPage === cursor) {
        break;
      }

      cursor = nextPage;
    }

    return { plants, cursor };
  }

  public async getPlant(plantId: string): Promise<PlantaPlant> {
    const result = await this.request<PlantaPlant>(
      "GET",
      `/addedPlants/${plantId}`,
    );
    return result.data ?? ({ id: plantId } as PlantaPlant);
  }

  private async ensureAuthorized(): Promise<void> {
    if (this.isAccessTokenValid()) {
      return;
    }

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

    this.tokens = {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      tokenType: result.data.tokenType ?? "Bearer",
    };
  }

  private async refreshTokens(): Promise<void> {
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

    this.tokens = {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken ?? this.tokens.refreshToken,
      tokenType: result.data.tokenType ?? this.tokens.tokenType ?? "Bearer",
    };
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

    const url = new URL(`${API_V1_ENDPOINT}${path}`);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    let response: Response;

    try {
      response = await fetch(url.toString(), {
        method,
        headers,
        body: options?.json ? JSON.stringify(options.json) : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
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
        if (retryOnUnauthorized) {
          if (this.tokens?.refreshToken) {
            try {
              await this.refreshTokens();
              return this.request(method, path, options, requireAuth, false);
            } catch (error) {
              if (
                !(error instanceof PlantaUnauthorizedError) ||
                !this.authCode
              ) {
                throw error;
              }
            }
          }

          if (this.authCode) {
            await this.authorize(this.authCode);
            return this.request(method, path, options, requireAuth, false);
          }
        }

        throw new PlantaUnauthorizedError(message);
      }

      throw new PlantaError(`${errorType}: ${message}`);
    }

    return { ...payload, status: response.status };
  }
}

export const createPlantaClientFromEnv = (): PlantaClient => {
  const hasAccessToken = Boolean(env.PLANTA_ACCESS_TOKEN);
  const hasRefreshToken = Boolean(env.PLANTA_REFRESH_TOKEN);

  const tokens =
    hasAccessToken || hasRefreshToken
      ? {
          accessToken: env.PLANTA_ACCESS_TOKEN ?? "",
          refreshToken: env.PLANTA_REFRESH_TOKEN,
          tokenType: env.PLANTA_TOKEN_TYPE ?? "Bearer",
        }
      : undefined;

  return new PlantaClient({
    tokens,
    authCode: env.PLANTA_AUTH_CODE,
  });
};
