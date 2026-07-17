import { notifyPlantNudge } from "./plant.ts";

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
