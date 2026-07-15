import { Suspense } from "react";

import { getFindMeConditionsResult } from "@/vendors/openMeteo/service.ts";

import WeatherBadgeView, {
  SOURCE_LABEL,
  WeatherBadgePlaceholder,
} from "./WeatherBadgeView.tsx";

/**
 * Fetches the weather conditions on the server and renders the badge. Success
 * and failure are handled here at the server boundary; the "loading" case is
 * the `<Suspense>` fallback in `WeatherBadge`.
 */
async function WeatherBadgeContent(): Promise<React.ReactNode> {
  const result = await getFindMeConditionsResult();

  if (!result.ok) {
    return (
      <WeatherBadgePlaceholder ariaLabel={`${result.error} ${SOURCE_LABEL}`} />
    );
  }

  return <WeatherBadgeView data={result} />;
}

/**
 * The FindMe map renders immediately; this badge streams in independently once
 * its conditions resolve, so the tile never blocks on the weather fetch. It is
 * a Server Component passed into the client `FindMe` tile as a slot.
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
