import type { FindMeProps } from "./FindMe.types.ts";
import type { FindMeConditionsSuccessResponse } from "@/lib/findMeConditions/types.ts";

import { FIND_ME_LOCATION } from "./FindMe.const.ts";

export const mockFindMeConditions: FindMeConditionsSuccessResponse = {
  ok: true,
  location: FIND_ME_LOCATION,
  weather: {
    temperatureCelsius: 18,
    conditionLabel: "Clouds",
    iconName: "weather-cloud",
  },
  updatedAt: "2026-07-13T09:00:00.000Z",
};

export const mockFindMeProps = {
  sizeKey: "findme",
  className: "size-full",
} satisfies FindMeProps;
