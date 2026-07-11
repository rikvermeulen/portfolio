import type { FindMeConditionsState } from "./useFindMeConditions.ts";

export interface FindMeProps {
  readonly className?: string;
}

export interface FindMeWeatherBadgeProps {
  readonly state: FindMeConditionsState;
}

export interface FindMeWeatherBadgeShellProps {
  readonly ariaLabel: string;
  readonly children: React.ReactNode;
}

export interface FindMeWeatherBadgePlaceholderProps {
  readonly ariaLabel: string;
}

export interface FindMeWeatherBadgeSuccessProps {
  readonly state: Extract<FindMeConditionsState, { status: "success" }>;
}
