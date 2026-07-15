import type {
  WeatherBadgePlaceholderProps,
  WeatherBadgeShellProps,
  WeatherBadgeViewProps,
} from "./FindMe.types.ts";

import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";

export const SOURCE_LABEL = "Weather by Open-Meteo for Rotterdam.";

function WeatherBadgeShell({ ariaLabel, children }: WeatherBadgeShellProps) {
  return (
    <div
      aria-label={ariaLabel}
      aria-live="polite"
      role="status"
      title={SOURCE_LABEL}
      className="absolute top-5 left-5 z-20 flex overflow-hidden rounded-lg p-1 text-black dark:bg-black/45 dark:text-white"
    >
      <Glass blur={2} intensity={2} radius={8} />
      <div className="bento-body relative flex flex-col">{children}</div>
    </div>
  );
}

export function WeatherBadgePlaceholder({
  ariaLabel,
}: WeatherBadgePlaceholderProps) {
  return (
    <WeatherBadgeShell ariaLabel={ariaLabel}>
      <Icon iconClassName="size-4" name="weather-cloud" />
      <span>--°</span>
    </WeatherBadgeShell>
  );
}

function WeatherBadgeView({ data }: WeatherBadgeViewProps) {
  const { weather } = data;
  const ariaLabel = `${weather.conditionLabel}, ${weather.temperatureCelsius} degrees Celsius. ${SOURCE_LABEL}`;

  return (
    <WeatherBadgeShell ariaLabel={ariaLabel}>
      <div className="flex items-center">
        <Icon iconClassName="size-4" name={weather.iconName} />
        <span className="font-medium">{`${weather.temperatureCelsius}°`}</span>
      </div>
    </WeatherBadgeShell>
  );
}

export default WeatherBadgeView;
