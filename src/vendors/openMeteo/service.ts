import "server-only";

import type {
  FindMeConditionsErrorResponse,
  FindMeConditionsSuccessResponse,
} from "@/lib/weather/types.ts";

import { toFindMeWeather } from "@/lib/weather/conditions.ts";
import { FIND_ME_LOCATION } from "@/modules/Bentos/FindMe/FindMe.const.ts";

import { fetchOpenMeteoForecast } from "./client.ts";

const FIND_ME_CONDITIONS_ERROR = "Unable to load weather right now.";

export const fetchFindMeConditions =
  async (): Promise<FindMeConditionsSuccessResponse> => {
    const forecastPayload = await fetchOpenMeteoForecast();

    return {
      ok: true,
      location: FIND_ME_LOCATION,
      weather: toFindMeWeather(forecastPayload),
      updatedAt: new Date().toISOString(),
    };
  };

export const getFindMeConditionsResult = async (): Promise<
  FindMeConditionsSuccessResponse | FindMeConditionsErrorResponse
> => {
  try {
    return await fetchFindMeConditions();
  } catch {
    return {
      ok: false,
      error: FIND_ME_CONDITIONS_ERROR,
    };
  }
};
