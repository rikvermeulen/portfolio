import type { FindMeProps, FindMeWeatherBadgeProps } from "./FindMe.types.ts";

export const mockFindMeProps = {
  className: "size-full",
} satisfies FindMeProps;

export const mockFindMeWeatherBadgeProps = {
  state: {
    status: "success",
    data: {
      ok: true,
      location: {
        label: "Heukelum, Netherlands",
        latitude: 51.872,
        longitude: 5.078,
      },
      weather: {
        temperatureCelsius: 18,
        conditionLabel: "Partly cloudy",
        iconName: "weather-cloud-sun",
      },
      airQuality: {
        europeanAqi: 23,
        categoryLabel: "Fair",
      },
      updatedAt: "2026-06-12T12:00:00.000Z",
    },
  },
} satisfies FindMeWeatherBadgeProps;
