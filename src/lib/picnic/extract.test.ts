import {
  extractSavedRecipeIds,
  extractSavedRecipes,
  findFusionNodeById,
} from "./extract.ts";

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const makeRecipeTile = (
  recipeId: string,
  title: string,
  opts: {
    imageAssetId?: string;
    servings?: number;
    totalMinutes?: number;
    hookText?: string;
  } = {},
) => ({
  analytics: {
    contexts: [
      {
        data: { recipe_id: recipeId, segment_type: "SAVED_RECIPES" },
      },
    ],
  },
  pml: {
    component: {
      onPress: {
        target: `app.picnic://store/page;id=selling-group-details-page,selling_group_id=${recipeId}`,
      },
    },
  },
  children: [
    ...(opts.imageAssetId
      ? [
          {
            type: "IMAGE",
            source: { id: opts.imageAssetId },
            derivativeType: "filled",
          },
        ]
      : []),
    { markdown: title },
    ...(opts.hookText ? [{ markdown: `#(#295813)${opts.hookText}#` }] : []),
    ...(opts.servings != null && opts.totalMinutes != null
      ? [
          {
            accessibilityLabel: `${title} voor ${opts.servings} personen ${opts.totalMinutes} Bereidingstijd.`,
          },
        ]
      : []),
  ],
});

const makeCookbookPage = (tiles: unknown[]) => ({
  id: "segment-control-list-SAVED_RECIPES",
  children: tiles,
});

// ─── extractSavedRecipes ───────────────────────────────────────────────────────

describe("extractSavedRecipes", () => {
  it("extracts recipes sorted alphabetically by title", () => {
    const page = makeCookbookPage([
      makeRecipeTile("id-b", "Zucchini pasta"),
      makeRecipeTile("id-a", "Avocado toast"),
    ]);

    const recipes = extractSavedRecipes(page);

    expect(recipes.map((r) => r.title)).toEqual([
      "Avocado toast",
      "Zucchini pasta",
    ]);
    expect(recipes.map((r) => r.id)).toEqual(["id-a", "id-b"]);
  });

  it("extracts the recipe image asset ID from IMAGE nodes", () => {
    const page = makeCookbookPage([
      makeRecipeTile("id-1", "Pasta", { imageAssetId: "recipes/abc123" }),
    ]);

    const recipe = extractSavedRecipes(page)[0]!;

    expect(recipe.imageAssetId).toBe("recipes/abc123");
  });

  it("extracts servings and totalMinutes from accessibility label", () => {
    const page = makeCookbookPage([
      makeRecipeTile("id-1", "Pasta", { servings: 4, totalMinutes: 20 }),
    ]);

    const recipe = extractSavedRecipes(page)[0]!;

    expect(recipe.servings).toBe(4);
    expect(recipe.totalMinutes).toBe(20);
  });

  it("extracts hookText as the subtitle", () => {
    const page = makeCookbookPage([
      makeRecipeTile("id-1", "Pasta", { hookText: "Supersnelle favoriet" }),
    ]);

    const recipe = extractSavedRecipes(page)[0]!;

    expect(recipe.subtitle).toBe("Supersnelle favoriet");
  });

  it("sets the deeplink from pml.component.onPress.target", () => {
    const page = makeCookbookPage([makeRecipeTile("id-1", "Pasta")]);

    const recipe = extractSavedRecipes(page)[0]!;

    expect(recipe.deeplink).toContain("selling_group_id=id-1");
  });

  it("deduplicates tiles with the same recipe ID", () => {
    const page = makeCookbookPage([
      makeRecipeTile("id-1", "Pasta"),
      makeRecipeTile("id-1", "Pasta duplicate"),
    ]);

    expect(extractSavedRecipes(page)).toHaveLength(1);
  });

  it("returns an empty array for an empty page", () => {
    expect(extractSavedRecipes({})).toEqual([]);
  });

  it("falls back to ID-only extraction when the saved segment is missing", () => {
    const payload = {
      recipe_id: "fallback-id",
      saved_at: "2024-01-01T00:00:00Z",
    };

    const recipes = extractSavedRecipes(payload);

    expect(recipes).toHaveLength(1);
    expect(recipes[0]!.id).toBe("fallback-id");
    expect(recipes[0]!.title).toBe("Recipe fallback-id");
  });
});

// ─── extractSavedRecipeIds ─────────────────────────────────────────────────────

describe("extractSavedRecipeIds", () => {
  it("collects IDs from within the saved-recipes segment", () => {
    const page = makeCookbookPage([
      makeRecipeTile("id-1", "Recipe A"),
      makeRecipeTile("id-2", "Recipe B"),
    ]);

    const ids = extractSavedRecipeIds(page);

    expect(ids).toContain("id-1");
    expect(ids).toContain("id-2");
  });

  it("returns an empty array when no recipe IDs are found", () => {
    expect(extractSavedRecipeIds({})).toEqual([]);
  });

  it("falls back to scanning the whole payload when segment is absent", () => {
    const payload = {
      recipe_id: "fallback-id",
      saved_at: "2024-01-01T00:00:00Z",
    };

    expect(extractSavedRecipeIds(payload)).toContain("fallback-id");
  });
});

// ─── findFusionNodeById ────────────────────────────────────────────────────────

describe("findFusionNodeById", () => {
  it("returns the node with a matching id", () => {
    const payload = {
      children: [
        { id: "other-node", title: "Other" },
        { id: "target-node", title: "My Recipe", name: null },
      ],
    };

    const node = findFusionNodeById(payload, "target-node");

    expect(node).not.toBeNull();
    expect(node?.id).toBe("target-node");
    expect(node?.title).toBe("My Recipe");
  });

  it("uses name as a title fallback", () => {
    const payload = { id: "n1", name: "Named Recipe" };

    expect(findFusionNodeById(payload, "n1")?.title).toBe("Named Recipe");
  });

  it("uses label as a title fallback when title and name are absent", () => {
    const payload = { id: "n1", label: "Labelled Recipe" };

    expect(findFusionNodeById(payload, "n1")?.title).toBe("Labelled Recipe");
  });

  it('falls back to "Untitled recipe" when no title-like field is present', () => {
    const payload = { id: "n1" };

    expect(findFusionNodeById(payload, "n1")?.title).toBe("Untitled recipe");
  });

  it("returns null when the node is not found", () => {
    expect(findFusionNodeById({ id: "other" }, "missing")).toBeNull();
  });

  it("returns null for an empty payload", () => {
    expect(findFusionNodeById({}, "anything")).toBeNull();
  });

  it("searches nested arrays", () => {
    const payload = {
      nested: [[{ id: "deep", title: "Deep Recipe" }]],
    };

    expect(findFusionNodeById(payload, "deep")?.id).toBe("deep");
  });
});
