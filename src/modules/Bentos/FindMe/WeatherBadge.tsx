import { Suspense } from "react";

import { getFindMeConditionsResult } from "@/vendors/openMeteo/service.ts";

import WeatherBadgeView, {
  SOURCE_LABEL,
  WeatherBadgePlaceholder,
} from "./WeatherBadgeView.tsx";

/** Fetches the conditions on the server; success and failure both resolve here. */
async function WeatherBadgeContent() {
  const result = await getFindMeConditionsResult();

  return result.ok ? (
    <WeatherBadgeView weather={result.data} />
  ) : (
    <WeatherBadgePlaceholder
      ariaLabel={`${result.errorMessage} ${SOURCE_LABEL}`}
    />
  );
}

/**
 * Server-rendered weather badge passed into the client `FindMe` tile as a slot.
 * The map renders immediately; this streams in once the conditions resolve, so
 * the tile never blocks on the weather fetch. The `<Suspense>` fallback covers
 * the loading state.
 */
function WeatherBadge() {
  return (
    <Suspense
      fallback={
        <WeatherBadgePlaceholder
          ariaLabel={`Loading weather. ${SOURCE_LABEL}`}
        />
      }
    >
      <WeatherBadgeContent />
    </Suspense>
  );
}

export default WeatherBadge;
