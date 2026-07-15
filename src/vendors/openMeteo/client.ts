import { FIND_ME_LOCATION } from "@/modules/Bentos/FindMe/FindMe.const.ts";

const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_TIMEOUT_MS = 5000;

/** The Open-Meteo forecast request URL for the FindMe location. */
const buildForecastUrl = (): string => {
  const url = new URL(FORECAST_ENDPOINT);

  url.searchParams.set("latitude", FIND_ME_LOCATION.latitude.toString());
  url.searchParams.set("longitude", FIND_ME_LOCATION.longitude.toString());
  url.searchParams.set("current", "temperature_2m,weather_code,is_day");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  return url.toString();
};

/** Fetch the current forecast as raw JSON. Throws on a non-ok response. */
export const fetchOpenMeteoForecast = async (): Promise<unknown> => {
  const response = await fetch(buildForecastUrl(), {
    cache: "no-store",
    signal: AbortSignal.timeout(OPEN_METEO_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with ${response.status}`);
  }

  return response.json();
};
