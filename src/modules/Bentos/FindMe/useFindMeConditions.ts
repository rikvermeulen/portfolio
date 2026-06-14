"use client";

import { useEffect, useState } from "react";

import type {
  FindMeConditionsResponse,
  FindMeConditionsSuccessResponse,
  FindMeWeatherIconName,
} from "@/lib/findMeConditions/types.ts";

interface FindMeConditionsLoadingState {
  readonly status: "loading";
}

interface FindMeConditionsSuccessState {
  readonly status: "success";
  readonly data: FindMeConditionsSuccessResponse;
}

interface FindMeConditionsErrorState {
  readonly status: "error";
  readonly message: string;
}

export type FindMeConditionsState =
  | FindMeConditionsLoadingState
  | FindMeConditionsSuccessState
  | FindMeConditionsErrorState;

const CONDITIONS_URL = "/api/find-me/conditions";
const FALLBACK_ERROR_MESSAGE =
  "Unable to load weather and air quality right now.";

const WEATHER_ICON_NAMES: readonly string[] = [
  "weather-cloud",
  "weather-cloud-sun",
  "weather-fog",
  "weather-moon",
  "weather-rain",
  "weather-snow",
  "weather-sun",
  "weather-thunderstorm",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isWeatherIconName = (value: unknown): value is FindMeWeatherIconName =>
  typeof value === "string" && WEATHER_ICON_NAMES.includes(value);

const isFindMeConditionsSuccessResponse = (
  value: unknown,
): value is FindMeConditionsSuccessResponse => {
  if (!isRecord(value) || value.ok !== true) {
    return false;
  }

  const { airQuality, location, updatedAt, weather } = value;

  if (
    !isRecord(location) ||
    typeof location.label !== "string" ||
    typeof location.latitude !== "number" ||
    typeof location.longitude !== "number"
  ) {
    return false;
  }

  if (
    !isRecord(weather) ||
    typeof weather.temperatureCelsius !== "number" ||
    typeof weather.conditionLabel !== "string" ||
    !isWeatherIconName(weather.iconName)
  ) {
    return false;
  }

  if (
    !isRecord(airQuality) ||
    typeof airQuality.europeanAqi !== "number" ||
    typeof airQuality.categoryLabel !== "string"
  ) {
    return false;
  }

  return typeof updatedAt === "string";
};

const isFindMeConditionsErrorResponse = (
  value: unknown,
): value is Extract<FindMeConditionsResponse, { ok: false }> =>
  isRecord(value) && value.ok === false && typeof value.error === "string";

const isFindMeConditionsResponse = (
  value: unknown,
): value is FindMeConditionsResponse =>
  isFindMeConditionsSuccessResponse(value) ||
  isFindMeConditionsErrorResponse(value);

export const useFindMeConditions = (): FindMeConditionsState => {
  const [state, setState] = useState<FindMeConditionsState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const loadConditions = async (): Promise<void> => {
      try {
        const response = await fetch(CONDITIONS_URL, {
          signal: controller.signal,
        });
        const payload: unknown = await response.json();

        if (!isFindMeConditionsResponse(payload)) {
          throw new Error("Invalid FindMe conditions response.");
        }

        if (!isActive) {
          return;
        }

        if (!response.ok || !payload.ok) {
          setState({
            status: "error",
            message: payload.ok ? FALLBACK_ERROR_MESSAGE : payload.error,
          });
          return;
        }

        setState({
          status: "success",
          data: payload,
        });
      } catch {
        if (controller.signal.aborted || !isActive) {
          return;
        }

        setState({
          status: "error",
          message: FALLBACK_ERROR_MESSAGE,
        });
      }
    };

    void loadConditions();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  return state;
};
