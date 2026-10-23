import type { PlantaPlantCardData } from "./types.ts";

import {
  formatPlantaDueText,
  getPlantaCardStatuses,
  isPlantaHappyHealth,
} from "./plantCardFormat.ts";

const card = (
  overrides: Partial<PlantaPlantCardData> = {},
): PlantaPlantCardData => ({
  id: "plant-1",
  name: "Monstera",
  ...overrides,
});

describe("formatPlantaDueText", () => {
  it("returns soon when days are undefined", () => {
    expect(formatPlantaDueText(undefined)).toBe("soon");
  });

  it("returns today for zero or negative days", () => {
    expect(formatPlantaDueText(0)).toBe("today");
    expect(formatPlantaDueText(-1)).toBe("today");
  });

  it("returns in 1 day for one day", () => {
    expect(formatPlantaDueText(1)).toBe("in 1 day");
  });

  it("returns plural days otherwise", () => {
    expect(formatPlantaDueText(5)).toBe("in 5 days");
  });
});

describe("isPlantaHappyHealth", () => {
  it("returns false for missing health", () => {
    expect(isPlantaHappyHealth(undefined)).toBe(false);
    expect(isPlantaHappyHealth("")).toBe(false);
  });

  it("matches common positive health phrases", () => {
    expect(isPlantaHappyHealth("Happy")).toBe(true);
    expect(isPlantaHappyHealth("Looking good")).toBe(true);
    expect(isPlantaHappyHealth("THRIVING")).toBe(true);
  });

  it("returns false for neutral or negative text", () => {
    expect(isPlantaHappyHealth("Needs care")).toBe(false);
    expect(isPlantaHappyHealth("Wilting")).toBe(false);
  });
});

describe("getPlantaCardStatuses", () => {
  it("surfaces due care first, watering before misting", () => {
    expect(
      getPlantaCardStatuses(
        card({ dueCareActionTypes: ["misting", "watering"] }),
      ),
    ).toEqual([
      { state: "due", actionType: "watering", label: "Water today" },
      { state: "due", actionType: "misting", label: "Mist today" },
    ]);
  });

  it("shows due care and an upcoming action together", () => {
    expect(
      getPlantaCardStatuses(
        card({
          dueCareActionTypes: ["watering"],
          nextActionType: "fertilizing",
          daysUntilNextAction: 5,
        }),
      ),
    ).toEqual([
      { state: "due", actionType: "watering", label: "Water today" },
      {
        state: "scheduled",
        actionType: "fertilizing",
        label: "Fertilize in 5 days",
      },
    ]);
  });

  it("does not repeat the next action when it is already due", () => {
    expect(
      getPlantaCardStatuses(
        card({
          dueCareActionTypes: ["watering"],
          nextActionType: "watering",
          daysUntilNextAction: 0,
        }),
      ),
    ).toEqual([{ state: "due", actionType: "watering", label: "Water today" }]);
  });

  it("still reports health alongside an upcoming action", () => {
    expect(
      getPlantaCardStatuses(
        card({
          health: "thriving",
          nextActionType: "watering",
          daysUntilNextAction: 7,
        }),
      ),
    ).toEqual([
      { state: "scheduled", actionType: "watering", label: "Water in 7 days" },
      { state: "healthy", label: "Healthy" },
    ]);
  });

  it("falls back to all done when nothing else applies", () => {
    expect(getPlantaCardStatuses(card({ health: "steady" }))).toEqual([
      { state: "healthy", label: "All done" },
    ]);
  });
});
