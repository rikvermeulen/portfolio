import type { WeatherCondition } from "./types.ts";

// Open-Meteo WMO weather codes → display label + icon. See the WMO code table
// at https://open-meteo.com/en/docs. Codes not listed fall back to `UNKNOWN`.
export const WEATHER_CONDITIONS: readonly WeatherCondition[] = [
  { codes: [0], iconName: "weather-sun", label: "Clear", nightIconName: "weather-moon" }, // prettier-ignore
  { codes: [1, 2], iconName: "weather-cloud-sun", label: "Partly cloudy" },
  { codes: [3], iconName: "weather-cloud", label: "Cloudy" },
  { codes: [45, 48], iconName: "weather-fog", label: "Fog" },
  { codes: [51, 53, 55, 56, 57], iconName: "weather-rain", label: "Drizzle" },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], iconName: "weather-rain", label: "Rain" }, // prettier-ignore
  { codes: [71, 73, 75, 77, 85, 86], iconName: "weather-snow", label: "Snow" },
  { codes: [95, 96, 99], iconName: "weather-thunderstorm", label: "Thunderstorm" }, // prettier-ignore
] as const;

export const UNKNOWN_WEATHER_CONDITION = {
  iconName: "weather-cloud",
  label: "Weather",
} as const;
