import type { FindMeConditionsState } from "./useFindMeConditions.ts";
import type { ReactNode } from "react";

export interface FindMeProps {
  readonly className?: string;
}

export interface FindMeWeatherBadgeProps {
  readonly state: FindMeConditionsState;
}

export interface FindMeWeatherBadgeShellProps {
  readonly ariaLabel: string;
  readonly children: ReactNode;
}

export interface FindMeWeatherBadgePlaceholderProps {
  readonly ariaLabel: string;
}

export interface FindMeWeatherBadgeSuccessProps {
  readonly state: Extract<FindMeConditionsState, { status: "success" }>;
}
