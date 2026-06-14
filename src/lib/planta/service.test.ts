import { PlantaError, PlantaUnauthorizedError } from "./client.ts";
import { getPlantaPlantsResult, toPlantaErrorMessage } from "./service.ts";

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
});
