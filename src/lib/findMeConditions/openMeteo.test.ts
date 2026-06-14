import { FIND_ME_LOCATION } from "@/constants/findMe.ts";

import {
  buildOpenMeteoAirQualityUrl,
  buildOpenMeteoForecastUrl,
  getEuropeanAqiCategory,
  getWeatherCondition,
  toFindMeAirQuality,
  toFindMeWeather,
} from "./openMeteo.ts";

describe("Open-Meteo FindMe adapter", () => {
  it("builds forecast and air-quality URLs from the shared FindMe location", () => {
    const forecastUrl = new URL(buildOpenMeteoForecastUrl());
    const airQualityUrl = new URL(buildOpenMeteoAirQualityUrl());

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

    expect(`${airQualityUrl.origin}${airQualityUrl.pathname}`).toBe(
      "https://air-quality-api.open-meteo.com/v1/air-quality",
    );
    expect(airQualityUrl.searchParams.get("latitude")).toBe(
      FIND_ME_LOCATION.latitude.toString(),
    );
    expect(airQualityUrl.searchParams.get("longitude")).toBe(
      FIND_ME_LOCATION.longitude.toString(),
    );
    expect(airQualityUrl.searchParams.get("current")).toBe("european_aqi");
    expect(airQualityUrl.searchParams.get("domains")).toBe("cams_europe");
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

  it.each([
    [0, "Good"],
    [20, "Good"],
    [21, "Fair"],
    [40, "Fair"],
    [41, "Moderate"],
    [60, "Moderate"],
    [61, "Poor"],
    [80, "Poor"],
    [81, "Very poor"],
    [100, "Very poor"],
    [101, "Extremely poor"],
  ])("maps European AQI %s to %s", (aqi, category) => {
    expect(getEuropeanAqiCategory(aqi)).toBe(category);
  });

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

  it("maps validated air-quality payloads into FindMe air quality", () => {
    expect(
      toFindMeAirQuality({
        current: {
          european_aqi: 24.3,
          time: "2026-06-12T12:00",
        },
      }),
    ).toEqual({
      categoryLabel: "Fair",
      europeanAqi: 24,
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

    expect(() =>
      toFindMeAirQuality({
        current: {
          european_aqi: "24",
          time: "2026-06-12T12:00",
        },
      }),
    ).toThrow();
  });
});
