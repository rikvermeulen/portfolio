import { fetchPlantaPlantsData, getPlantaPlantsResult } from "./service.ts";

jest.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

jest.mock("./client.ts", () => ({
  createPlantaClientFromEnv: jest.fn(),
}));

const { createPlantaClientFromEnv } = jest.requireMock("./client.ts") as {
  createPlantaClientFromEnv: jest.Mock;
};

const mockPlants = (getPlants: jest.Mock) =>
  createPlantaClientFromEnv.mockResolvedValue({ getPlants });

describe("Planta service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("returns mapped data on success", async () => {
    mockPlants(
      jest
        .fn()
        .mockResolvedValue([{ id: "plant-1", names: { custom: "Monstera" } }]),
    );

    const result = await getPlantaPlantsResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.plantCards[0]?.name).toBe("Monstera");
    }
  });

  it("caps the dashboard at 6 plants", async () => {
    mockPlants(
      jest
        .fn()
        .mockResolvedValue(
          Array.from({ length: 8 }, (_, index) => ({ id: `plant-${index}` })),
        ),
    );

    const data = await fetchPlantaPlantsData();

    expect(data.plantCards).toHaveLength(6);
  });

  it("returns ok:false when no plants are configured", async () => {
    mockPlants(jest.fn().mockResolvedValue([]));

    await expect(getPlantaPlantsResult()).resolves.toEqual({
      ok: false,
      errorMessage: "No Planta plants available right now.",
    });
  });

  it("logs the upstream error and returns a fixed message", async () => {
    const error = new Error("unauthorized: token rejected");
    mockPlants(jest.fn().mockRejectedValue(error));

    await expect(getPlantaPlantsResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Unable to load Planta plants right now.",
    });
    expect(console.error).toHaveBeenCalledWith("Planta plants failed:", error);
  });
});
