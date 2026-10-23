import "server-only";

import type { FindMeWeather } from "@/lib/weather/types.ts";
import type { Result } from "@/types/index.ts";

import { toFindMeWeather } from "@/lib/weather/conditions.ts";

import { fetchOpenMeteoForecast } from "./client.ts";

const FIND_ME_CONDITIONS_ERROR = "Unable to load weather right now.";

/** Fetch the current FindMe weather, mapping any failure to a safe error result. */
export const getFindMeConditionsResult = async (): Promise<
  Result<FindMeWeather>
> => {
  try {
    const payload = await fetchOpenMeteoForecast();
    return { ok: true, data: toFindMeWeather(payload) };
  } catch {
    return { ok: false, errorMessage: FIND_ME_CONDITIONS_ERROR };
  }
};
