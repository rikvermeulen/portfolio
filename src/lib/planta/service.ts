import { unstable_cache } from "next/cache";

import type { PlantaPlant, PlantaPlantCardData } from "@/lib/planta/types.ts";

import {
  createPlantaClientFromEnv,
  PlantaError,
  PlantaUnauthorizedError,
} from "@/lib/planta/client.ts";
import { toPlantaPlantCards } from "@/lib/planta/selectors.ts";

export interface PlantaPlantsData {
  readonly rawPlants: readonly PlantaPlant[];
  readonly plantCards: readonly PlantaPlantCardData[];
}

export interface PlantaPlantsSuccessResult {
  readonly ok: true;
  readonly statusCode: 200;
  readonly data: PlantaPlantsData;
}

export interface PlantaPlantsErrorResult {
  readonly ok: false;
  readonly statusCode: 401 | 500;
  readonly errorMessage: string;
}

export type PlantaPlantsResult =
  | PlantaPlantsSuccessResult
  | PlantaPlantsErrorResult;

const MAX_PLANTS_TO_FETCH = 6 as const;

export const fetchPlantaPlantsData = async (): Promise<PlantaPlantsData> => {
  const client = createPlantaClientFromEnv();
  const { plants } = await client.getPlants({
    fetchAll: false,
    maxPlants: MAX_PLANTS_TO_FETCH,
  });

  return {
    rawPlants: plants,
    plantCards: toPlantaPlantCards(plants),
  };
};

/**
 * Cached plants data. The Planta client hardcodes `cache: "no-store"` and can
 * run a token-refresh POST → GET waterfall on cold requests, so without this
 * every dashboard render blocks the `@plants` slot on a live (possibly double)
 * round trip. Plant care data changes slowly; 30 min revalidate is reasonable.
 * The wrapped fn throws on failure, so errors aren't cached.
 */
const getCachedPlantaPlantsData = unstable_cache(
  fetchPlantaPlantsData,
  ["planta-plants"],
  { revalidate: 1800, tags: ["planta"] },
);

export const toPlantaErrorMessage = (error: unknown): string => {
  if (error instanceof PlantaUnauthorizedError) {
    return "Planta authentication failed. Your refresh token or auth code was rejected by Planta.";
  }

  if (error instanceof PlantaError) {
    return error.message;
  }

  return "Unable to load Planta plants right now.";
};

export const toPlantaStatusCode = (error: unknown): 401 | 500 => {
  if (error instanceof PlantaUnauthorizedError) {
    return 401;
  }

  return 500;
};

export const getPlantaPlantsResult = async (): Promise<PlantaPlantsResult> => {
  try {
    const data = await getCachedPlantaPlantsData();

    return {
      ok: true,
      statusCode: 200,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      statusCode: toPlantaStatusCode(error),
      errorMessage: toPlantaErrorMessage(error),
    };
  }
};
