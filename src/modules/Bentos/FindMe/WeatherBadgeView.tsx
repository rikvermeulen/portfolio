import type {
  WeatherBadgePlaceholderProps,
  WeatherBadgeProps,
  WeatherBadgeViewProps,
} from "./FindMe.types.ts";

import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { RADIUS } from "@/lib/radius/index.ts";

export const SOURCE_LABEL = "Weather by Open-Meteo for Rotterdam.";

/** Glass pill that renders a weather icon and label; shared by every badge state. */
function WeatherBadge({ ariaLabel, iconName, label }: WeatherBadgeProps) {
  return (
    <output
      aria-label={ariaLabel}
      aria-live="polite"
      title={SOURCE_LABEL}
      className="absolute top-5 left-5 z-20 flex overflow-hidden rounded-field p-1 text-black dark:bg-black/45 dark:text-white"
    >
      <Glass blur={2} intensity={2} radius={RADIUS.field} />
      <div className="bento-body relative flex items-center gap-0.5">
        <Icon iconClassName="size-4" name={iconName} />
        <span className="font-medium">{label}</span>
      </div>
    </output>
  );
}

/** Shown while the weather is loading or after a fetch failure. */
export function WeatherBadgePlaceholder({
  ariaLabel,
}: WeatherBadgePlaceholderProps) {
  return (
    <WeatherBadge ariaLabel={ariaLabel} iconName="weather-cloud" label="--°" />
  );
}

/** The resolved weather badge, rendered from server-fetched conditions. */
function WeatherBadgeView({ weather }: WeatherBadgeViewProps) {
  return (
    <WeatherBadge
      ariaLabel={`${weather.conditionLabel}, ${weather.temperatureCelsius} degrees Celsius. ${SOURCE_LABEL}`}
      iconName={weather.iconName}
      label={`${weather.temperatureCelsius}°`}
    />
  );
}

export default WeatherBadgeView;
