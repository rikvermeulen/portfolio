import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type {
  FindMeWeather,
  FindMeWeatherIconName,
} from "@/lib/weather/types.ts";

export interface FindMeProps extends BentoSizedProps {
  readonly className?: string;
  /**
   * Weather badge, fetched on the server and streamed in via `<Suspense>`. Passed
   * as a slot so the interactive map renders immediately while the conditions
   * resolve independently — the client tile owns no loading/error state.
   */
  readonly weatherBadge?: React.ReactNode;
}

export interface WeatherBadgeProps {
  readonly ariaLabel: string;
  readonly iconName: FindMeWeatherIconName;
  readonly label: string;
}

export interface WeatherBadgePlaceholderProps {
  readonly ariaLabel: string;
}

export interface WeatherBadgeViewProps {
  readonly weather: FindMeWeather;
}
