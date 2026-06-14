import "server-only";

import type {
  FindMeConditionsErrorResponse,
  FindMeConditionsSuccessResponse,
} from "./types.ts";

import { FIND_ME_LOCATION } from "@/constants/findMe.ts";

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, OPEN_METEO_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed with ${response.status}`);
    }

    const payload: unknown = await response.json();

    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
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
