import { notifyPlantNudge, notifyPlantSummary } from "./plant.ts";

const sendNotification = jest.fn();

jest.mock("@/vendors/ntfy/index.ts", () => ({
  sendNotification: (...args: unknown[]) => sendNotification(...args),
}));

describe("notifyPlantNudge", () => {
  beforeEach(() => {
    sendNotification.mockReset();
    sendNotification.mockResolvedValue({ ok: true });
  });

  it("sends a plant nudge notification", async () => {
    const result = await notifyPlantNudge("Monstera", "water", "today");

    expect(result).toEqual({ ok: true });
    expect(sendNotification).toHaveBeenCalledWith(
      "🌱 Monstera needs water.\nPoked by a visitor · today",
      "Plant care",
    );
  });
});

describe("notifyPlantSummary", () => {
  beforeEach(() => {
    sendNotification.mockReset();
    sendNotification.mockResolvedValue({ ok: true });
  });

  it("summarises every due plant and its actions in one push", async () => {
    const result = await notifyPlantSummary(
      [
        { name: "Monstera", actions: ["water", "mist"] },
        { name: "Fern", actions: ["water"] },
      ],
      "today",
    );

    expect(result).toEqual({ ok: true });
    expect(sendNotification).toHaveBeenCalledWith(
      "🌱 2 plants need attention:\n• Monstera — water, mist\n• Fern — water\nPoked by a visitor · today",
      "Plant care",
    );
  });

  it("uses singular wording for a single due plant", async () => {
    await notifyPlantSummary([{ name: "Fern", actions: ["mist"] }], "today");

    expect(sendNotification).toHaveBeenCalledWith(
      "🌱 1 plant needs attention:\n• Fern — mist\nPoked by a visitor · today",
      "Plant care",
    );
  });

  it("reassures when nothing is due", async () => {
    await notifyPlantSummary([], "today");

    expect(sendNotification).toHaveBeenCalledWith(
      "🌿 A visitor checked in — all your plants look happy.\nPoked by a visitor · today",
      "Plant care",
    );
  });
});
