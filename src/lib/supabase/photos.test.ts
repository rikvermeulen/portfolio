import { getPhotosResult } from "./photos.ts";

const mockList = jest.fn();
const mockGetPublicUrl = jest.fn();

jest.mock("@/lib/supabase/supabase.ts", () => ({
  createSupabaseClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        list: mockList,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  })),
}));

const mockEnv = {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
};

jest.mock("@/env.ts", () => ({
  get env() {
    return mockEnv;
  },
}));

describe("getPhotosResult", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnv.SUPABASE_URL = "https://test.supabase.co";
    mockEnv.SUPABASE_ANON_KEY = "test-anon-key";
    mockList.mockResolvedValue({ data: [] });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://cdn.example.com/photo.jpg" },
    });
  });

  it("returns ok:false when Supabase is not configured", async () => {
    mockEnv.SUPABASE_URL = "";

    await expect(getPhotosResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Photos are not configured",
    });
    expect(mockList).not.toHaveBeenCalled();
  });

  it("returns ok:false when the anon key is missing", async () => {
    mockEnv.SUPABASE_ANON_KEY = "";

    await expect(getPhotosResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Photos are not configured",
    });
    expect(mockList).not.toHaveBeenCalled();
  });

  it("returns album URLs grouped by album name", async () => {
    mockList.mockImplementation(async (albumName: string) => {
      if (albumName === "apps") {
        return { data: [{ name: "sunset.jpg" }, { name: "beach.mp4" }] };
      }
      return { data: [] };
    });
    mockGetPublicUrl.mockImplementation((path: string) => ({
      data: { publicUrl: `https://cdn.example.com/${path}` },
    }));

    const result = await getPhotosResult();

    expect(result).toEqual({
      ok: true,
      data: {
        apps: [
          "https://cdn.example.com/apps/sunset.jpg",
          "https://cdn.example.com/apps/beach.mp4",
        ],
        map: [],
        heart: [],
        dog: [],
      },
    });
    expect(mockList).toHaveBeenCalledTimes(4);
    expect(mockGetPublicUrl).toHaveBeenCalledWith("apps/sunset.jpg");
    expect(mockGetPublicUrl).toHaveBeenCalledWith("apps/beach.mp4");
  });

  it("returns ok:false when every album is empty", async () => {
    mockList.mockResolvedValue({ data: [] });

    await expect(getPhotosResult()).resolves.toEqual({
      ok: false,
      errorMessage: "No photos found",
    });
  });

  it("treats missing list data as an empty album", async () => {
    mockList.mockResolvedValue({ data: null });

    await expect(getPhotosResult()).resolves.toEqual({
      ok: false,
      errorMessage: "No photos found",
    });
  });

  it("drops files whose public URL cannot be resolved", async () => {
    mockList.mockResolvedValue({ data: [{ name: "broken.jpg" }] });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: undefined } });

    await expect(getPhotosResult()).resolves.toEqual({
      ok: false,
      errorMessage: "No photos found",
    });
  });

  it("returns ok:false when fetching albums throws", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(jest.fn());
    mockList.mockRejectedValue(new Error("network error"));

    await expect(getPhotosResult()).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load photos right now",
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[supabase] getPhotosResult failed:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
