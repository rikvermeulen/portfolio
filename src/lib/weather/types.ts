export type FindMeWeatherIconName =
  | "weather-cloud"
  | "weather-cloud-sun"
  | "weather-fog"
  | "weather-moon"
  | "weather-rain"
  | "weather-snow"
  | "weather-sun"
  | "weather-thunderstorm";

export interface FindMeWeather {
  readonly temperatureCelsius: number;
  readonly conditionLabel: string;
  readonly iconName: FindMeWeatherIconName;
}

export interface WeatherCondition {
  readonly codes: readonly number[];
  readonly iconName: FindMeWeatherIconName;
  readonly label: string;
  /** Icon to prefer at night; falls back to `iconName` when omitted. */
  readonly nightIconName?: FindMeWeatherIconName;
}
