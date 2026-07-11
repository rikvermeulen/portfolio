import "server-only";

import type {
  FindMeConditionsErrorResponse,
  FindMeConditionsSuccessResponse,
} from "./types.ts";

import { FIND_ME_LOCATION } from "@/modules/Bentos/FindMe/FindMe.const.ts";

import {
  buildOpenMeteoAirQualityUrl,
  buildOpenMeteoForecastUrl,
  toFindMeAirQuality,
  toFindMeWeather,
} from "./openMeteo.ts";

const FIND_ME_CONDITIONS_ERROR =
  "Unable to load weather and air quality right now.";
const OPEN_METEO_TIMEOUT_MS = 5000;

const fetchOpenMeteoJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(OPEN_METEO_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with ${response.status}`);
  }

  return response.json();
};

export const fetchFindMeConditions =
  async (): Promise<FindMeConditionsSuccessResponse> => {
    const [forecastPayload, airQualityPayload] = await Promise.all([
      fetchOpenMeteoJson(buildOpenMeteoForecastUrl()),
      fetchOpenMeteoJson(buildOpenMeteoAirQualityUrl()),
    ]);

    return {
      ok: true,
      location: FIND_ME_LOCATION,
      weather: toFindMeWeather(forecastPayload),
      airQuality: toFindMeAirQuality(airQualityPayload),
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
