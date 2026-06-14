import {
  formatPlantaDueText,
  getPlantaPlantStatusTags,
  isPlantaHappyHealth,
} from "./plantCardFormat.ts";

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

describe("getPlantaPlantStatusTags", () => {
  it("treats missing next action as watered", () => {
    expect(getPlantaPlantStatusTags(undefined, undefined)).toEqual([
      "Got water",
    ]);
  });

  it("handles watering due state", () => {
    expect(getPlantaPlantStatusTags("watering", 0)).toEqual(["Need water"]);
    expect(getPlantaPlantStatusTags("watering", 3)).toEqual(["Got water"]);
  });

  it("handles misting", () => {
    expect(getPlantaPlantStatusTags("misting", 0)).toEqual([
      "Need attention",
      "Misting",
    ]);
    expect(getPlantaPlantStatusTags("misting", 2)).toEqual(["Misting soon"]);
  });

  it("handles other action types", () => {
    expect(getPlantaPlantStatusTags("fertilizing", 0)).toEqual([
      "Need attention",
      "Fertilize",
    ]);
    expect(getPlantaPlantStatusTags("fertilizing", 5)).toEqual(["Fertilize"]);
  });
});
