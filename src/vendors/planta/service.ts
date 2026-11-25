import { unstable_cache } from "next/cache";

import type {
  PlantaPlantsData,
  PlantaPlantsResult,
} from "@/lib/plants/types.ts";

import { toPlantaPlantCards } from "@/lib/plants/selectors.ts";

import { createPlantaClientFromEnv } from "./client.ts";

const MAX_PLANTS_TO_FETCH = 6 as const;

export const fetchPlantaPlantsData = async (): Promise<PlantaPlantsData> => {
  const client = await createPlantaClientFromEnv();
  const plants = await client.getPlants();

  return {
    plantCards: toPlantaPlantCards(plants.slice(0, MAX_PLANTS_TO_FETCH)),
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

export const getPlantaPlantsResult = async (): Promise<PlantaPlantsResult> => {
  try {
    const data = await getCachedPlantaPlantsData();

    if (data.plantCards.length === 0) {
      return {
        ok: false,
        errorMessage: "No Planta plants available right now.",
      };
    }

    return { ok: true, data };
  } catch (error) {
    // Upstream messages stay in the logs; visitors get a fixed message.
    console.error("Planta plants failed:", error);
    return {
      ok: false,
      errorMessage: "Unable to load Planta plants right now.",
    };
  }
};
