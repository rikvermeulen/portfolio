import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { FindMeConditionsSuccessResponse } from "@/lib/findMeConditions/types.ts";

export interface FindMeProps extends BentoSizedProps {
  readonly className?: string;
  /**
   * The weather badge, fetched on the server and streamed in via `<Suspense>`.
   * Passed as a slot so the interactive map renders immediately while the
   * conditions resolve independently — no client-side loading/error state.
   */
  readonly weatherBadge?: React.ReactNode;
}

export interface WeatherBadgeShellProps {
  readonly ariaLabel: string;
  readonly children: React.ReactNode;
}

export interface WeatherBadgePlaceholderProps {
  readonly ariaLabel: string;
}

export interface WeatherBadgeViewProps {
  readonly data: FindMeConditionsSuccessResponse;
}
