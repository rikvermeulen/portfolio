import { actionLabels, toPlantaPlantCards } from "./selectors.ts";
import { plantaActionTypes } from "./types.ts";

const NOW_MS = Date.parse("2026-06-14T12:00:00.000Z");
const futureDate = (daysFromNow: number) =>
  new Date(NOW_MS + daysFromNow * 86_400_000).toISOString();

const makePlant = (
  id: string,
  overrides: Partial<import("./types.ts").PlantaPlant> = {},
): import("./types.ts").PlantaPlant => ({
  id,
  names: { custom: `Plant ${id}` },
  ...overrides,
});

describe("plantaActionTypes", () => {
  it("exports all action type strings", () => {
    expect(plantaActionTypes).toEqual([
      "watering",
      "fertilizing",
      "misting",
      "cleaning",
      "repotting",
      "progressUpdate",
    ]);
  });
});

describe("actionLabels", () => {
  it("has a label for every action type", () => {
    plantaActionTypes.forEach((type) => {
      expect(actionLabels[type]).toBeTruthy();
    });
  });
});

describe("toPlantaPlantCards", () => {
  it("returns an empty array when given no plants", () => {
    expect(toPlantaPlantCards([])).toEqual([]);
  });

  it("uses custom name when available", () => {
    const cards = toPlantaPlantCards([
      makePlant("1", { names: { custom: "My Fern" } }),
    ]);
    expect(cards[0]?.name).toBe("My Fern");
  });

  it("falls back to localizedName when custom is absent", () => {
    const cards = toPlantaPlantCards([
      makePlant("1", { names: { localizedName: "Boston Fern" } }),
    ]);
    expect(cards[0]?.name).toBe("Boston Fern");
  });

  it("falls back to Unnamed plant when both names are absent", () => {
    const cards = toPlantaPlantCards([makePlant("1", { names: {} })]);
    expect(cards[0]?.name).toBe("Unnamed plant");
  });

  it("maps health, siteName, imageUrl and scientificName", () => {
    const plant = makePlant("1", {
      health: "Happy",
      site: { name: "Living room" },
      image: { url: "https://img.example.com/plant.jpg" },
      names: { custom: "Monstera", scientific: "Monstera deliciosa" },
    });
    const [card] = toPlantaPlantCards([plant]);
    expect(card?.health).toBe("Happy");
    expect(card?.siteName).toBe("Living room");
    expect(card?.imageUrl).toBe("https://img.example.com/plant.jpg");
    expect(card?.scientificName).toBe("Monstera deliciosa");
  });

  it("sets no nextAction fields when the plant has no actions", () => {
    const [card] = toPlantaPlantCards([makePlant("1")]);
    expect(card?.nextActionType).toBeUndefined();
    expect(card?.daysUntilNextAction).toBeUndefined();
  });

  it("picks the earliest upcoming action from the priority list", () => {
    const plant = makePlant("1", {
      actions: {
        watering: { next: { date: futureDate(5) } },
        fertilizing: { next: { date: futureDate(2) } },
        misting: { next: { date: futureDate(10) } },
      },
    });

    jest.spyOn(Date, "now").mockReturnValue(NOW_MS);
    const [card] = toPlantaPlantCards([plant]);
    jest.restoreAllMocks();

    expect(card?.nextActionType).toBe("fertilizing");
    expect(card?.daysUntilNextAction).toBe(2);
  });

  it("skips actions whose date cannot be parsed", () => {
    const plant = makePlant("1", {
      actions: {
        watering: { next: { date: "not-a-date" } },
        misting: { next: { date: futureDate(3) } },
      },
    });

    jest.spyOn(Date, "now").mockReturnValue(NOW_MS);
    const [card] = toPlantaPlantCards([plant]);
    jest.restoreAllMocks();

    expect(card?.nextActionType).toBe("misting");
  });

  it("marks watering as a due care action when it is overdue", () => {
    const plant = makePlant("1", {
      actions: {
        watering: { next: { date: futureDate(-1) } },
        misting: { next: { date: futureDate(3) } },
      },
    });

    jest.spyOn(Date, "now").mockReturnValue(NOW_MS);
    const [card] = toPlantaPlantCards([plant]);
    jest.restoreAllMocks();

    expect(card?.dueCareActionTypes).toContain("watering");
    expect(card?.dueCareActionTypes).not.toContain("misting");
  });

  it("does not mark a future care action as due", () => {
    const plant = makePlant("1", {
      actions: {
        watering: { next: { date: futureDate(5) } },
      },
    });

    jest.spyOn(Date, "now").mockReturnValue(NOW_MS);
    const [card] = toPlantaPlantCards([plant]);
    jest.restoreAllMocks();

    expect(card?.dueCareActionTypes).toHaveLength(0);
  });

  it("sorts plants by daysUntilNextAction ascending", () => {
    const plants = [
      makePlant("a", {
        actions: { watering: { next: { date: futureDate(10) } } },
      }),
      makePlant("b", {
        actions: { watering: { next: { date: futureDate(2) } } },
      }),
      makePlant("c", {
        actions: { watering: { next: { date: futureDate(5) } } },
      }),
    ];

    jest.spyOn(Date, "now").mockReturnValue(NOW_MS);
    const cards = toPlantaPlantCards(plants);
    jest.restoreAllMocks();

    expect(cards.map((c) => c.id)).toEqual(["b", "c", "a"]);
  });

  it("places plants with no next action after those with one", () => {
    const plants = [
      makePlant("no-action"),
      makePlant("has-action", {
        actions: { watering: { next: { date: futureDate(1) } } },
      }),
    ];

    jest.spyOn(Date, "now").mockReturnValue(NOW_MS);
    const cards = toPlantaPlantCards(plants);
    jest.restoreAllMocks();

    expect(cards[0]?.id).toBe("has-action");
    expect(cards[1]?.id).toBe("no-action");
  });

  it("breaks ties by name alphabetically", () => {
    const plants = [
      makePlant("z", {
        names: { custom: "Zebra plant" },
        actions: { watering: { next: { date: futureDate(3) } } },
      }),
      makePlant("a", {
        names: { custom: "Aloe vera" },
        actions: { watering: { next: { date: futureDate(3) } } },
      }),
    ];

    jest.spyOn(Date, "now").mockReturnValue(NOW_MS);
    const cards = toPlantaPlantCards(plants);
    jest.restoreAllMocks();

    expect(cards[0]?.name).toBe("Aloe vera");
  });

  it("sorts plants with no action alphabetically among themselves", () => {
    const plants = [
      makePlant("2", { names: { custom: "Zantedeschia" } }),
      makePlant("1", { names: { custom: "Agave" } }),
    ];
    const cards = toPlantaPlantCards(plants);
    expect(cards[0]?.name).toBe("Agave");
  });

  it("covers leftDays-undefined branch — no-action plant sorted after two plants with actions", () => {
    // Place z (no-action) in the middle so V8's insertion sort calls compare(z, a) first,
    // hitting the `leftDays === undefined` → return 1 branch (line 117).
    const plants = [
      makePlant("a", {
        names: { custom: "Aaa" },
        actions: { watering: { next: { date: futureDate(2) } } },
      }),
      makePlant("z", { names: { custom: "Zzz" } }),
      makePlant("b", {
        names: { custom: "Bbb" },
        actions: { watering: { next: { date: futureDate(5) } } },
      }),
    ];

    jest.spyOn(Date, "now").mockReturnValue(NOW_MS);
    const cards = toPlantaPlantCards(plants);
    jest.restoreAllMocks();

    expect(cards[2]?.id).toBe("z");
  });
});
