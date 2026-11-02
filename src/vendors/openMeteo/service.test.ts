import { getFindMeConditionsResult } from "./service.ts";

const createJsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });

describe("getFindMeConditionsResult", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns mapped weather data from Open-Meteo", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      createJsonResponse({
        current: {
          is_day: 1,
          temperature_2m: 18.4,
          time: "2026-06-12T12:30",
          weather_code: 61,
        },
      }),
    );

    await expect(getFindMeConditionsResult()).resolves.toEqual({
      ok: true,
      data: {
        conditionLabel: "Rain",
        iconName: "weather-rain",
        temperatureCelsius: 18,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      "https://api.open-meteo.com/v1/forecast",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ cache: "no-store" });
  });

  it("returns a safe error when Open-Meteo responds with a non-ok status", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ reason: "upstream down" }, 500));

    await expect(getFindMeConditionsResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Unable to load weather right now.",
    });
  });

  it("returns a safe error when the request is aborted by the timeout", async () => {
    const controller = new AbortController();
    jest.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);

    jest.spyOn(globalThis, "fetch").mockImplementation((_url, opts) => {
      return new Promise<Response>((_resolve, reject) => {
        (opts as RequestInit).signal?.addEventListener("abort", () => {
          const err = new Error("The operation was aborted.");
          err.name = "AbortError";
          reject(err);
        });
      });
    });

    const resultPromise = getFindMeConditionsResult();
    controller.abort();

    await expect(resultPromise).resolves.toEqual({
      ok: false,
      errorMessage: "Unable to load weather right now.",
    });
  });
});
