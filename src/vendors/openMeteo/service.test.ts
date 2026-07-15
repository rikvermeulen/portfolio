import { FIND_ME_LOCATION } from "@/modules/Bentos/FindMe/FindMe.const.ts";

import { fetchFindMeConditions, getFindMeConditionsResult } from "./service.ts";

const createJsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });

describe("FindMe conditions service", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-06-12T10:30:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns weather data from Open-Meteo", async () => {
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
      location: FIND_ME_LOCATION,
      weather: {
        conditionLabel: "Rain",
        iconName: "weather-rain",
        temperatureCelsius: 18,
      },
      updatedAt: "2026-06-12T10:30:00.000Z",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      "https://api.open-meteo.com/v1/forecast",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "no-store",
    });
  });

  it("returns a safe error when Open-Meteo fails", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ reason: "upstream down" }, 500));

    await expect(getFindMeConditionsResult()).resolves.toEqual({
      ok: false,
      error: "Unable to load weather right now.",
    });
  });

  it("aborts the fetch and returns an error when the timeout fires", async () => {
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

    const result = await resultPromise;
    expect(result.ok).toBe(false);
  });

  it("fetchFindMeConditions resolves with location and weather data", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      createJsonResponse({
        current: {
          is_day: 1,
          temperature_2m: 22,
          time: "2026-06-12T12:30",
          weather_code: 0,
        },
      }),
    );

    const result = await fetchFindMeConditions();
    expect(result.ok).toBe(true);
    expect(result.location).toBe(FIND_ME_LOCATION);
  });
});
