import { PicnicError } from "./client.ts";
import {
  fetchPicnicAuthKey,
  fetchSavedPicnicRecipes,
  getPicnicRecipesResult,
  toPicnicErrorMessage,
} from "./service.ts";

const mockGetPage = jest.fn();
const mockEnsurePicnicAuth = jest.fn();
const mockCreatePicnicClientFromEnv = jest.fn();

jest.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

jest.mock("./client.ts", () => ({
  createPicnicClientFromEnv: (...args: unknown[]) =>
    mockCreatePicnicClientFromEnv(...args),
  ensurePicnicAuth: (...args: unknown[]) => mockEnsurePicnicAuth(...args),
  PicnicError: class PicnicError extends Error {
    public constructor(message: string) {
      super(message);
      this.name = "PicnicError";
    }
  },
}));

jest.mock("@/lib/recipes/extract.ts", () => ({
  extractSavedRecipes: jest
    .fn()
    .mockReturnValue([
      { id: "r1", title: "Pasta", imageAssetId: "recipes/abc" },
    ]),
}));

const mockEnv = {
  PICNIC_COUNTRY_CODE: "NL" as "NL" | "DE" | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

describe("fetchSavedPicnicRecipes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPage.mockResolvedValue({
      format: "fusion",
      page: { page: "cookbook-data" },
    });
    mockEnsurePicnicAuth.mockResolvedValue("auth-key-123");
    mockCreatePicnicClientFromEnv.mockReturnValue({
      app: { getPage: mockGetPage },
    });
  });

  it("returns recipe cards with proxied image URLs and no auth key", async () => {
    const result = await fetchSavedPicnicRecipes();

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("r1");
    expect(result[0]?.imageUrl).toContain("/api/picnic/image");
    expect(JSON.stringify(result)).not.toContain("auth-key-123");
  });

  it("throws PicnicError when the cookbook page is not served as fusion", async () => {
    mockGetPage.mockResolvedValue({ format: "rsc", content: "" });

    await expect(fetchSavedPicnicRecipes()).rejects.toBeInstanceOf(PicnicError);
  });
});

describe("fetchSavedPicnicRecipes — country code", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPage.mockResolvedValue({
      format: "fusion",
      page: { page: "cookbook-data" },
    });
    mockEnsurePicnicAuth.mockResolvedValue("auth-key-123");
    mockCreatePicnicClientFromEnv.mockReturnValue({
      app: { getPage: mockGetPage },
    });
  });

  it("uses the DE storefront when PICNIC_COUNTRY_CODE is DE", async () => {
    mockEnv.PICNIC_COUNTRY_CODE = "DE";

    const result = await fetchSavedPicnicRecipes();

    expect(result[0]?.imageUrl).toContain(
      "storefront-prod.de.picnicinternational.com",
    );
  });
});

describe("fetchPicnicAuthKey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePicnicClientFromEnv.mockReturnValue({
      app: { getPage: mockGetPage },
    });
  });

  it("returns the auth key when login succeeds", async () => {
    mockEnsurePicnicAuth.mockResolvedValue("fresh-auth-key");

    const key = await fetchPicnicAuthKey();

    expect(key).toBe("fresh-auth-key");
    expect(mockEnsurePicnicAuth).toHaveBeenCalledWith(expect.anything(), {
      forceLogin: true,
    });
  });

  it("throws PicnicError when no auth key is returned", async () => {
    mockEnsurePicnicAuth.mockResolvedValue(null);

    await expect(fetchPicnicAuthKey()).rejects.toBeInstanceOf(PicnicError);
  });
});

describe("toPicnicErrorMessage", () => {
  it("returns the message from a PicnicError", () => {
    const { PicnicError: MockPicnicError } = jest.requireMock(
      "./client.ts",
    ) as {
      PicnicError: typeof PicnicError;
    };
    expect(toPicnicErrorMessage(new MockPicnicError("Picnic went down"))).toBe(
      "Picnic went down",
    );
  });

  it("returns the message from a generic Error", () => {
    expect(toPicnicErrorMessage(new Error("something broke"))).toBe(
      "something broke",
    );
  });

  it("returns the fallback string for non-Error values", () => {
    expect(toPicnicErrorMessage("oops")).toBe(
      "Unknown Picnic error while loading recipes.",
    );
  });
});

describe("getPicnicRecipesResult", () => {
  beforeEach(() => {
    mockCreatePicnicClientFromEnv.mockReturnValue({
      app: { getPage: mockGetPage },
    });
    mockEnsurePicnicAuth.mockResolvedValue("auth-key");
    mockGetPage.mockResolvedValue({ format: "fusion", page: {} });
  });

  it("returns ok:true with recipeCards on success", async () => {
    const result = await getPicnicRecipesResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.recipeCards).toHaveLength(1);
    }
  });

  it("returns ok:false when no recipes are saved", async () => {
    const { extractSavedRecipes } = jest.requireMock(
      "@/lib/recipes/extract.ts",
    ) as {
      extractSavedRecipes: jest.Mock;
    };
    extractSavedRecipes.mockReturnValueOnce([]);
    mockGetPage.mockResolvedValue({ format: "fusion", page: { recipes: {} } });
    const result = await getPicnicRecipesResult();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorMessage).toBe("No saved recipes found.");
    }
  });

  it("returns ok:false with errorMessage when fetchSavedPicnicRecipes throws", async () => {
    mockGetPage.mockRejectedValue(new Error("network failure"));
    const result = await getPicnicRecipesResult();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorMessage).toBe("network failure");
    }
  });
});
