import { PlantaError, PlantaUnauthorizedError } from "./client.ts";
import {
  fetchPlantaPlantsData,
  getPlantaPlantsResult,
  toPlantaErrorMessage,
  toPlantaStatusCode,
} from "./service.ts";

jest.mock("./client.ts", () => {
  return {
    createPlantaClientFromEnv: jest.fn(),
    PlantaError: class PlantaError extends Error {
      public constructor(message: string) {
        super(message);
        this.name = "PlantaError";
      }
    },
    PlantaUnauthorizedError: class PlantaUnauthorizedError extends Error {
      public constructor(message: string) {
        super(message);
        this.name = "PlantaUnauthorizedError";
      }
    },
  };
});

const { createPlantaClientFromEnv } = jest.requireMock("./client.ts") as {
  createPlantaClientFromEnv: jest.Mock;
};

describe("Planta service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a structured unauthorized result", async () => {
    createPlantaClientFromEnv.mockReturnValue({
      getPlants: jest
        .fn()
        .mockRejectedValue(
          new PlantaUnauthorizedError(
            "You are not authorized to make this request",
          ),
        ),
    });

    await expect(getPlantaPlantsResult()).resolves.toEqual({
      ok: false,
      statusCode: 401,
      errorMessage:
        "Planta authentication failed. Your refresh token or auth code was rejected by Planta.",
    });
  });

  it("returns mapped data on success", async () => {
    createPlantaClientFromEnv.mockReturnValue({
      getPlants: jest.fn().mockResolvedValue({
        plants: [
          {
            id: "plant-1",
            names: {
              custom: "Monstera",
            },
          },
        ],
      }),
    });

    const result = await getPlantaPlantsResult();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.plantCards[0]?.name).toBe("Monstera");
    }
  });

  it("keeps explicit Planta errors readable", () => {
    expect(
      toPlantaErrorMessage(new PlantaError("Planta request timed out.")),
    ).toBe("Planta request timed out.");
  });

  it("returns the fallback string for a plain Error (not a PlantaError)", () => {
    expect(toPlantaErrorMessage(new Error("network failure"))).toBe(
      "Unable to load Planta plants right now.",
    );
  });

  it("returns the fallback string for non-Error values", () => {
    expect(toPlantaErrorMessage("some string")).toBe(
      "Unable to load Planta plants right now.",
    );
    expect(toPlantaErrorMessage(42)).toBe(
      "Unable to load Planta plants right now.",
    );
  });

  it("returns 401 for PlantaUnauthorizedError", () => {
    expect(toPlantaStatusCode(new PlantaUnauthorizedError("auth"))).toBe(401);
  });

  it("returns 500 for a generic PlantaError", () => {
    expect(toPlantaStatusCode(new PlantaError("boom"))).toBe(500);
  });

  it("fetchPlantaPlantsData returns rawPlants and plantCards", async () => {
    createPlantaClientFromEnv.mockReturnValue({
      getPlants: jest.fn().mockResolvedValue({
        plants: [{ id: "direct-plant", names: { custom: "DirectPlant" } }],
      }),
    });

    const data = await fetchPlantaPlantsData();

    expect(data.rawPlants[0]?.id).toBe("direct-plant");
    expect(data.plantCards[0]?.name).toBe("DirectPlant");
  });

  it("returns a 500 result when a non-unauthorized error is thrown", async () => {
    createPlantaClientFromEnv.mockReturnValue({
      getPlants: jest.fn().mockRejectedValue(new PlantaError("timeout")),
    });

    await expect(getPlantaPlantsResult()).resolves.toMatchObject({
      ok: false,
      statusCode: 500,
      errorMessage: "timeout",
    });
  });
});
