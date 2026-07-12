import type { FindMeConditionsSuccessResponse } from "@/lib/findMeConditions/types.ts";

interface FindMeConditionsLoadingState {
  readonly status: "loading";
}

interface FindMeConditionsSuccessState {
  readonly status: "success";
  readonly data: FindMeConditionsSuccessResponse;
}

interface FindMeConditionsErrorState {
  readonly status: "error";
  readonly message: string;
}

export type FindMeConditionsState =
  | FindMeConditionsLoadingState
  | FindMeConditionsSuccessState
  | FindMeConditionsErrorState;

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
