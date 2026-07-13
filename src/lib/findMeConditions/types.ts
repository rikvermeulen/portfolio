export type FindMeWeatherIconName =
  | "weather-cloud"
  | "weather-cloud-sun"
  | "weather-fog"
  | "weather-moon"
  | "weather-rain"
  | "weather-snow"
  | "weather-sun"
  | "weather-thunderstorm";

export interface FindMeLocation {
  readonly label: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface FindMeWeather {
  readonly temperatureCelsius: number;
  readonly conditionLabel: string;
  readonly iconName: FindMeWeatherIconName;
}

export interface FindMeConditionsSuccessResponse {
  readonly ok: true;
  readonly location: FindMeLocation;
  readonly weather: FindMeWeather;
  readonly updatedAt: string;
}

export interface FindMeConditionsErrorResponse {
  readonly ok: false;
  readonly error: string;
}

export type FindMeConditionsResponse =
  | FindMeConditionsSuccessResponse
  | FindMeConditionsErrorResponse;
