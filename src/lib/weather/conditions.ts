import { z } from "zod";

import type { FindMeWeather } from "./types.ts";

import {
  UNKNOWN_WEATHER_CONDITION,
  WEATHER_CONDITIONS,
} from "./conditions.const.ts";

const openMeteoForecastSchema = z.object({
  current: z.object({
    is_day: z.union([z.literal(0), z.literal(1)]),
    temperature_2m: z.number(),
    time: z.string().min(1),
    weather_code: z.number().int(),
  }),
});

/** Maps an Open-Meteo weather code (+ day/night) to a display label and icon. */
export const getWeatherCondition = (
  weatherCode: number,
  isDay: boolean,
): Pick<FindMeWeather, "conditionLabel" | "iconName"> => {
  const condition = WEATHER_CONDITIONS.find(({ codes }) =>
    codes.includes(weatherCode),
  );

  if (!condition) {
    return {
      conditionLabel: UNKNOWN_WEATHER_CONDITION.label,
      iconName: UNKNOWN_WEATHER_CONDITION.iconName,
    };
  }

  const iconName =
    !isDay && condition.nightIconName
      ? condition.nightIconName
      : condition.iconName;

  return {
    conditionLabel: condition.label,
    iconName,
  };
};

/** Validates a raw Open-Meteo forecast payload and maps it to domain weather. */
export const toFindMeWeather = (payload: unknown): FindMeWeather => {
  const forecast = openMeteoForecastSchema.parse(payload);
  const { conditionLabel, iconName } = getWeatherCondition(
    forecast.current.weather_code,
    forecast.current.is_day === 1,
  );

  return {
    conditionLabel,
    iconName,
    temperatureCelsius: Math.round(forecast.current.temperature_2m),
  };
};
