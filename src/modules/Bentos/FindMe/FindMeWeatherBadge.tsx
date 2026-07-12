import type {
  FindMeWeatherBadgePlaceholderProps,
  FindMeWeatherBadgeProps,
  FindMeWeatherBadgeShellProps,
  FindMeWeatherBadgeSuccessProps,
} from "./FindMe.types.ts";

import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";

const SOURCE_LABEL =
  "Weather by Open-Meteo and air quality by CAMS for Rotterdam.";

function FindMeWeatherBadgeShell({
  ariaLabel,
  children,
}: FindMeWeatherBadgeShellProps) {
  return (
    <div
      aria-label={ariaLabel}
      aria-live="polite"
      role="status"
      title={SOURCE_LABEL}
      className="absolute top-5 left-5 z-20 flex overflow-hidden rounded-lg px-2 py-1 text-black dark:bg-black/45 dark:text-white"
    >
      <Glass blur={2} intensity={2} radius={8} />
      <div className="relative flex flex-col text-xs">{children}</div>
    </div>
  );
}

function FindMeWeatherBadgePlaceholder({
  ariaLabel,
}: FindMeWeatherBadgePlaceholderProps) {
  return (
    <FindMeWeatherBadgeShell ariaLabel={ariaLabel}>
      <Icon iconClassName="size-4" name="weather-cloud" />
      <span>--°</span>
      <span className="text-ds-gray dark:text-white/60">AQI --</span>
    </FindMeWeatherBadgeShell>
  );
}

function FindMeWeatherBadgeSuccess({ state }: FindMeWeatherBadgeSuccessProps) {
  const { airQuality, weather } = state.data;
  const ariaLabel = `${weather.conditionLabel}, ${weather.temperatureCelsius} degrees Celsius. European air quality index ${airQuality.europeanAqi}, ${airQuality.categoryLabel}. ${SOURCE_LABEL}`;

  return (
    <FindMeWeatherBadgeShell ariaLabel={ariaLabel}>
      <div className="flex items-center gap-0.5">
        <Icon iconClassName="size-4" name={weather.iconName} />
        <span>{`${weather.temperatureCelsius}°`}</span>
      </div>
      <span className="text-[8px] text-ds-gray dark:text-white/60">{`AQI ${airQuality.europeanAqi}`}</span>
    </FindMeWeatherBadgeShell>
  );
}

function FindMeWeatherBadge({ state }: FindMeWeatherBadgeProps) {
  if (state.status === "success") {
    return <FindMeWeatherBadgeSuccess state={state} />;
  }

  if (state.status === "error") {
    return (
      <FindMeWeatherBadgePlaceholder
        ariaLabel={`${state.message} ${SOURCE_LABEL}`}
      />
    );
  }

  return (
    <FindMeWeatherBadgePlaceholder
      ariaLabel={`Loading weather and air quality. ${SOURCE_LABEL}`}
    />
  );
}

export default FindMeWeatherBadge;
