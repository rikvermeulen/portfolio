import { isNtfyConfigured, sendNotification } from "./client.ts";

const mockEnv = {
  NTFY_TOPIC: undefined as string | undefined,
  NTFY_SERVER: undefined as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

const okResponse = (): Response => new Response("", { status: 200 });

describe("ntfy client", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockEnv.NTFY_TOPIC = undefined;
    mockEnv.NTFY_SERVER = undefined;
  });

  describe("isNtfyConfigured", () => {
    it("reflects whether a topic is set", () => {
      expect(isNtfyConfigured()).toBe(false);
      mockEnv.NTFY_TOPIC = "rik-dash-9f3k2";
      expect(isNtfyConfigured()).toBe(true);
    });
  });

  describe("sendNotification", () => {
    it("skips without calling the API when no topic is set", async () => {
      const fetchMock = jest.spyOn(globalThis, "fetch");

      const result = await sendNotification("hi");

      expect(result).toEqual({ ok: false, skipped: true });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("publishes to the default server with a title header", async () => {
      mockEnv.NTFY_TOPIC = "rik-dash-9f3k2";
      const fetchMock = jest
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(okResponse());

      const result = await sendNotification(
        "🌱 Monstera needs water",
        "Plant care",
      );

      expect(result).toEqual({ ok: true });
      const [url, init] = fetchMock.mock.calls[0]!;
      expect(url).toBe("https://ntfy.sh/rik-dash-9f3k2");
      expect(init).toMatchObject({
        method: "POST",
        body: "🌱 Monstera needs water",
        headers: { Title: "Plant care" },
      });
    });

    it("uses a custom server and strips trailing slashes; omits title when absent", async () => {
      mockEnv.NTFY_TOPIC = "topic";
      mockEnv.NTFY_SERVER = "https://ntfy.example.com/";
      const fetchMock = jest
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(okResponse());

      await sendNotification("body only");

      const [url, init] = fetchMock.mock.calls[0]!;
      expect(url).toBe("https://ntfy.example.com/topic");
      expect((init as RequestInit).headers).toBeUndefined();
    });

    it("maps a non-2xx response to an error with the body", async () => {
      mockEnv.NTFY_TOPIC = "topic";
      jest
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("forbidden", { status: 403 }));

      const result = await sendNotification("hi");

      expect(result).toEqual({
        ok: false,
        skipped: false,
        error: "forbidden",
      });
    });

    it("falls back to the HTTP status when the error body can't be read", async () => {
      mockEnv.NTFY_TOPIC = "topic";
      jest.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.reject(new Error("stream error")),
      } as unknown as Response);

      const result = await sendNotification("hi");

      expect(result).toEqual({ ok: false, skipped: false, error: "HTTP 500" });
    });

    it("reports a timeout distinctly", async () => {
      mockEnv.NTFY_TOPIC = "topic";
      const timeout = new Error("aborted");
      timeout.name = "TimeoutError";
      jest.spyOn(globalThis, "fetch").mockRejectedValue(timeout);

      const result = await sendNotification("hi");

      expect(result).toEqual({
        ok: false,
        skipped: false,
        error: "ntfy request timed out.",
      });
    });

    it("maps a generic Error message", async () => {
      mockEnv.NTFY_TOPIC = "topic";
      jest
        .spyOn(globalThis, "fetch")
        .mockRejectedValue(new Error("connection refused"));

      const result = await sendNotification("hi");

      expect(result).toEqual({
        ok: false,
        skipped: false,
        error: "connection refused",
      });
    });

    it("maps a non-Error rejection to a fallback message", async () => {
      mockEnv.NTFY_TOPIC = "topic";
      jest.spyOn(globalThis, "fetch").mockRejectedValue("boom");

      const result = await sendNotification("hi");

      expect(result).toEqual({
        ok: false,
        skipped: false,
        error: "ntfy network request failed.",
      });
    });
  });
});
