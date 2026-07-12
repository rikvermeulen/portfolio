// Import from the barrel so index.ts lines are covered too.
import { PicnicError } from "./client.ts";
import {
  fetchPicnicAuthKey,
  fetchSavedPicnicRecipes,
  getPicnicRecipesResult,
  toPicnicErrorMessage,
} from "./index.ts";

const mockGetCookbookPage = jest.fn();
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

jest.mock("./extract.ts", () => ({
  extractSavedRecipes: jest
    .fn()
    .mockReturnValue([
      { id: "r1", title: "Pasta", imageAssetId: "recipes/abc" },
    ]),
  findFusionNodeById: jest.fn().mockReturnValue(null),
}));

jest.mock("./image.ts", () => ({
  buildPicnicImageUrl: jest
    .fn()
    .mockReturnValue("https://cdn.example.com/img.jpg"),
  buildPicnicRecipeUrl: jest
    .fn()
    .mockReturnValue("https://picnic.app/nl/recipe/r1"),
  toPicnicProxyImageUrl: jest
    .fn()
    .mockImplementation((url: string) => `/api/picnic/image?url=${url}`),
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
    mockGetCookbookPage.mockResolvedValue({ page: "cookbook-data" });
    mockEnsurePicnicAuth.mockResolvedValue("auth-key-123");
    mockCreatePicnicClientFromEnv.mockReturnValue({
      recipe: { getCookbookPage: mockGetCookbookPage },
    });
  });

  it("returns rawRecipes and recipeCards with proxied image URLs", async () => {
    const result = await fetchSavedPicnicRecipes();

    expect(result.rawRecipes).toHaveLength(1);
    expect(result.rawRecipes[0]?.id).toBe("r1");
    expect(result.recipeCards[0]?.imageUrl).toContain("/api/picnic/image");
    expect(result.authKey).toBe("auth-key-123");
  });

  it("returns the auth key from ensurePicnicAuth", async () => {
    const result = await fetchSavedPicnicRecipes();
    expect(result.authKey).toBe("auth-key-123");
  });
});

describe("fetchSavedPicnicRecipes — includeNodeId option", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCookbookPage.mockResolvedValue({ page: "cookbook-data" });
    mockEnsurePicnicAuth.mockResolvedValue("auth-key-123");
    mockCreatePicnicClientFromEnv.mockReturnValue({
      recipe: { getCookbookPage: mockGetCookbookPage },
    });
  });

  it("appends a new node when includeNodeId points to a unique node", async () => {
    const { findFusionNodeById } = jest.requireMock("./extract.ts") as {
      findFusionNodeById: jest.Mock;
    };
    findFusionNodeById.mockReturnValueOnce({
      id: "extra-node",
      title: "Extra Node",
    });

    const { extractSavedRecipes } = jest.requireMock("./extract.ts") as {
      extractSavedRecipes: jest.Mock;
    };
    extractSavedRecipes.mockReturnValueOnce([
      { id: "r1", title: "Pasta", imageAssetId: "recipes/abc" },
    ]);

    const result = await fetchSavedPicnicRecipes({
      includeNodeId: "extra-node",
    });

    expect(result.rawRecipes).toHaveLength(2);
  });

  it("does not duplicate when the node is already in rawRecipes", async () => {
    const { findFusionNodeById } = jest.requireMock("./extract.ts") as {
      findFusionNodeById: jest.Mock;
    };
    findFusionNodeById.mockReturnValueOnce({ id: "r1", title: "Pasta" });

    const result = await fetchSavedPicnicRecipes({ includeNodeId: "r1" });

    // r1 is already in the list — should not be duplicated
    expect(result.rawRecipes).toHaveLength(1);
  });

  it("returns rawRecipes unchanged when the node is not found", async () => {
    const { findFusionNodeById } = jest.requireMock("./extract.ts") as {
      findFusionNodeById: jest.Mock;
    };
    findFusionNodeById.mockReturnValueOnce(null);

    const result = await fetchSavedPicnicRecipes({
      includeNodeId: "missing-node",
    });

    expect(result.rawRecipes).toHaveLength(1);
  });
});

describe("fetchSavedPicnicRecipes — country code", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCookbookPage.mockResolvedValue({ page: "cookbook-data" });
    mockEnsurePicnicAuth.mockResolvedValue("auth-key-123");
    mockCreatePicnicClientFromEnv.mockReturnValue({
      recipe: { getCookbookPage: mockGetCookbookPage },
    });
  });

  it("passes 'de' to buildPicnicImageUrl when PICNIC_COUNTRY_CODE is DE", async () => {
    mockEnv.PICNIC_COUNTRY_CODE = "DE";

    await fetchSavedPicnicRecipes();

    const { buildPicnicImageUrl } = jest.requireMock("./image.ts") as {
      buildPicnicImageUrl: jest.Mock;
    };
    expect(buildPicnicImageUrl).toHaveBeenCalledWith(expect.anything(), "de");
  });
});

describe("fetchPicnicAuthKey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePicnicClientFromEnv.mockReturnValue({
      recipe: { getCookbookPage: mockGetCookbookPage },
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
      recipe: { getCookbookPage: mockGetCookbookPage },
    });
    mockEnsurePicnicAuth.mockResolvedValue("auth-key");
    mockGetCookbookPage.mockResolvedValue({});
  });

  it("returns ok:true with recipeCards on success", async () => {
    const result = await getPicnicRecipesResult();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.recipeCards).toHaveLength(1);
    }
  });

  it("returns ok:false when no recipes are saved", async () => {
    const { extractSavedRecipes } = jest.requireMock("./extract.ts") as {
      extractSavedRecipes: jest.Mock;
    };
    extractSavedRecipes.mockReturnValueOnce([]);
    mockGetCookbookPage.mockResolvedValue({ recipes: {} });
    const result = await getPicnicRecipesResult();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorMessage).toBe("No saved recipes found.");
    }
  });

  it("returns ok:false with errorMessage when fetchSavedPicnicRecipes throws", async () => {
    mockGetCookbookPage.mockRejectedValue(new Error("network failure"));
    const result = await getPicnicRecipesResult();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorMessage).toBe("network failure");
    }
  });
});
