import { z } from "zod";

import type {
  FindMeLocation,
  FindMeWeather,
  FindMeWeatherIconName,
} from "./types.ts";

import { FIND_ME_LOCATION } from "@/modules/Bentos/FindMe/FindMe.const.ts";

interface WeatherCondition {
  readonly codes: readonly number[];
  readonly iconName: FindMeWeatherIconName;
  readonly label: string;
  readonly nightIconName: FindMeWeatherIconName | null;
}

const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

const WEATHER_CONDITIONS: readonly WeatherCondition[] = [
  {
    codes: [0],
    iconName: "weather-sun",
    label: "Clear",
    nightIconName: "weather-moon",
  },
  {
    codes: [1, 2],
    iconName: "weather-cloud-sun",
    label: "Partly cloudy",
    nightIconName: null,
  },
  {
    codes: [3],
    iconName: "weather-cloud",
    label: "Cloudy",
    nightIconName: null,
  },
  {
    codes: [45, 48],
    iconName: "weather-fog",
    label: "Fog",
    nightIconName: null,
  },
  {
    codes: [51, 53, 55, 56, 57],
    iconName: "weather-rain",
    label: "Drizzle",
    nightIconName: null,
  },
  {
    codes: [61, 63, 65, 66, 67, 80, 81, 82],
    iconName: "weather-rain",
    label: "Rain",
    nightIconName: null,
  },
  {
    codes: [71, 73, 75, 77, 85, 86],
    iconName: "weather-snow",
    label: "Snow",
    nightIconName: null,
  },
  {
    codes: [95, 96, 99],
    iconName: "weather-thunderstorm",
    label: "Thunderstorm",
    nightIconName: null,
  },
] as const;

const UNKNOWN_WEATHER_CONDITION = {
  iconName: "weather-cloud",
  label: "Weather",
} as const;

const openMeteoForecastSchema = z.object({
  current: z.object({
    is_day: z.union([z.literal(0), z.literal(1)]),
    temperature_2m: z.number(),
    time: z.string().min(1),
    weather_code: z.number().int(),
  }),
});

export const buildOpenMeteoForecastUrl = (
  location: FindMeLocation = FIND_ME_LOCATION,
): string => {
  const url = new URL(FORECAST_ENDPOINT);

  url.searchParams.set("latitude", location.latitude.toString());
  url.searchParams.set("longitude", location.longitude.toString());
  url.searchParams.set("current", "temperature_2m,weather_code,is_day");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  return url.toString();
};

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
