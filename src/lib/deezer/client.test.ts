import { searchDeezerPreview } from "./client.ts";

const createJsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });

describe("searchDeezerPreview", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the preview URL when the API returns a result", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      createJsonResponse({
        data: [{ preview: "https://cdn.example.com/preview.mp3" }],
      }),
    );

    await expect(
      searchDeezerPreview("Blinding Lights", "The Weeknd"),
    ).resolves.toBe("https://cdn.example.com/preview.mp3");
  });

  it("returns null when the data array is empty", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ data: [] }));

    await expect(searchDeezerPreview("Unknown", "Nobody")).resolves.toBeNull();
  });

  it("returns null when the first item has no preview", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ data: [{ name: "track" }] }));

    await expect(searchDeezerPreview("Track", "Artist")).resolves.toBeNull();
  });

  it("returns null when the response is not ok", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ reason: "error" }, 500));

    await expect(searchDeezerPreview("Track", "Artist")).resolves.toBeNull();
  });

  it("returns null when the response has no data field", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(createJsonResponse({}));

    await expect(searchDeezerPreview("Track", "Artist")).resolves.toBeNull();
  });

  it("encodes the artist and name into the query string", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createJsonResponse({ data: [] }));

    await searchDeezerPreview("Nights", "Frank Ocean");

    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      encodeURIComponent("Nights Frank Ocean"),
    );
  });
});
