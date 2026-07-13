import { FIND_ME_LOCATION } from "@/modules/Bentos/FindMe/FindMe.const.ts";

import {
  buildOpenMeteoForecastUrl,
  getWeatherCondition,
  toFindMeWeather,
} from "./openMeteo.ts";

describe("Open-Meteo FindMe adapter", () => {
  it("builds the forecast URL from the shared FindMe location", () => {
    const forecastUrl = new URL(buildOpenMeteoForecastUrl());

    expect(`${forecastUrl.origin}${forecastUrl.pathname}`).toBe(
      "https://api.open-meteo.com/v1/forecast",
    );
    expect(forecastUrl.searchParams.get("latitude")).toBe(
      FIND_ME_LOCATION.latitude.toString(),
    );
    expect(forecastUrl.searchParams.get("longitude")).toBe(
      FIND_ME_LOCATION.longitude.toString(),
    );
    expect(forecastUrl.searchParams.get("current")).toBe(
      "temperature_2m,weather_code,is_day",
    );
    expect(forecastUrl.searchParams.get("temperature_unit")).toBe("celsius");
  });

  it.each([
    [0, true, "Clear", "weather-sun"],
    [0, false, "Clear", "weather-moon"],
    [2, false, "Partly cloudy", "weather-cloud-sun"],
    [3, true, "Cloudy", "weather-cloud"],
    [45, true, "Fog", "weather-fog"],
    [51, true, "Drizzle", "weather-rain"],
    [61, true, "Rain", "weather-rain"],
    [71, true, "Snow", "weather-snow"],
    [95, true, "Thunderstorm", "weather-thunderstorm"],
    [999, true, "Weather", "weather-cloud"],
  ])(
    "maps weather code %s to %s with %s",
    (code, isDay, conditionLabel, iconName) => {
      expect(getWeatherCondition(code, isDay)).toEqual({
        conditionLabel,
        iconName,
      });
    },
  );

  it("maps validated forecast payloads into FindMe weather", () => {
    expect(
      toFindMeWeather({
        current: {
          is_day: 1,
          temperature_2m: 12.6,
          time: "2026-06-12T12:00",
          weather_code: 1,
        },
      }),
    ).toEqual({
      conditionLabel: "Partly cloudy",
      iconName: "weather-cloud-sun",
      temperatureCelsius: 13,
    });
  });

  it("rejects malformed provider payloads", () => {
    expect(() =>
      toFindMeWeather({
        current: {
          is_day: 1,
          temperature_2m: "warm",
          time: "2026-06-12T12:00",
          weather_code: 1,
        },
      }),
    ).toThrow();
  });
});
