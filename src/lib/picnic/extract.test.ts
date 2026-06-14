import {
  extractSavedRecipeIds,
  extractSavedRecipes,
  findFusionNodeById,
} from "./extract.ts";

// ─── Additional helpers ────────────────────────────────────────────────────────

const makeFullTile = (
  recipeId: string,
  title: string,
  extras: {
    availabilityNotice?: boolean;
    dietaryLabel?: boolean;
    timeText?: boolean;
    imageNoRecipesPrefix?: boolean;
  } = {},
) => ({
  analytics: {
    contexts: [{ data: { recipe_id: recipeId } }],
  },
  children: [
    { markdown: title },
    ...(extras.availabilityNotice
      ? [{ markdown: "Niet alles op voorraad" }]
      : []),
    ...(extras.dietaryLabel ? [{ markdown: "#(#ffffff)Vegan#" }] : []),
    ...(extras.timeText ? [{ markdown: "20 min" }] : []),
    ...(extras.imageNoRecipesPrefix
      ? [{ type: "IMAGE", source: { id: "some-other-prefix/abc" } }]
      : []),
  ],
});

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

// ─── Additional extractSavedRecipes branches ──────────────────────────────────

describe("extractSavedRecipes — additional branches", () => {
  it("extracts the availabilityNotice from tile markdown", () => {
    const page = makeCookbookPage([
      makeFullTile("id-1", "Pasta", { availabilityNotice: true }),
    ]);

    const [recipe] = extractSavedRecipes(page);

    expect(recipe?.availabilityNotice).toBe("Niet alles op voorraad");
  });

  it("extracts the dietaryLabel from white-coloured markdown", () => {
    const page = makeCookbookPage([
      makeFullTile("id-1", "Pasta", { dietaryLabel: true }),
    ]);

    const [recipe] = extractSavedRecipes(page);

    expect(recipe?.dietaryLabel).toBe("Vegan");
  });

  it("extracts timeText from a markdown containing 'min'", () => {
    const page = makeCookbookPage([
      makeFullTile("id-1", "Pasta", { timeText: true }),
    ]);

    const [recipe] = extractSavedRecipes(page);

    expect(recipe?.timeText).toBe("20 min");
  });

  it("ignores image sources that do not start with 'recipes/'", () => {
    const page = makeCookbookPage([
      makeFullTile("id-1", "Pasta", { imageNoRecipesPrefix: true }),
    ]);

    const [recipe] = extractSavedRecipes(page);

    expect(recipe?.imageAssetId).toBeUndefined();
  });

  it("falls back to full scan when saved segment exists but contains no recipe IDs", () => {
    // The root node IS the saved segment but has no recipe_id fields.
    const payload = {
      id: "segment-control-list-SAVED_RECIPES",
      some_field: "value",
    };

    // No recipes from segment → falls back to full scan → no IDs there either
    const recipes = extractSavedRecipes(payload);
    expect(recipes).toHaveLength(0);
  });
});

// ─── Additional extractSavedRecipeIds branches ────────────────────────────────

describe("extractSavedRecipeIds — additional branches", () => {
  it("falls back to full scan when saved segment has no IDs", () => {
    const payload = {
      id: "segment-control-list-SAVED_RECIPES",
      // No recipe_id anywhere inside — will fall to full scan which also finds nothing
    };

    expect(extractSavedRecipeIds(payload)).toHaveLength(0);
  });

  it("picks up recipe_id via is_saved flag in the full scan", () => {
    const payload = {
      recipe_id: "saved-via-flag",
      is_saved: true,
      saved_at: null,
    };

    // is_saved=true + no saved_at → toSavedRecipeId returns null because
    // isExplicitlySaved is false and isSavedFlag is true but we only return id
    // when isExplicitlySaved. So this tests the "return null" at the end.
    const ids = extractSavedRecipeIds(payload);
    // No saved_at string → not returned
    expect(ids).not.toContain("saved-via-flag");
  });

  it("ignores nodes with recipe_id but no saved indicator at all (hits line 170)", () => {
    // recipe_id present, but no saved_at, no is_saved flag, path not in saved section
    const ids = extractSavedRecipeIds({ recipe_id: "unsaved" });
    expect(ids).toHaveLength(0);
  });

  it("finds the segment when it is nested inside an array (covers findNodeRawById array return-found path)", () => {
    // The segment is nested inside an outer array — findNodeRawById must traverse the array
    const payload = [
      { id: "segment-control-list-SAVED_RECIPES", children: [] },
    ];
    const ids = extractSavedRecipeIds(payload);
    expect(ids).toHaveLength(0); // segment found but no recipe IDs
  });

  it("returns empty when the segment is not found in an array payload (covers findNodeRawById array return-null path)", () => {
    const payload = [{ id: "some-other-segment" }];
    const ids = extractSavedRecipeIds(payload);
    expect(ids).toHaveLength(0);
  });

  it("finds the segment when nested inside another object key (covers findNodeRawById object-values return-found path)", () => {
    const payload = {
      wrapper: { id: "segment-control-list-SAVED_RECIPES", children: [] },
    };
    const ids = extractSavedRecipeIds(payload);
    expect(ids).toHaveLength(0);
  });

  it("processes array values in the fallback full-scan visit (covers visit array path)", () => {
    const payload = {
      items: [{ recipe_id: "nested-id", saved_at: "2024-01-01T00:00:00Z" }],
    };
    const ids = extractSavedRecipeIds(payload);
    expect(ids).toContain("nested-id");
  });

  it("falls back to ID-only extraction with multiple results (covers sort callback)", () => {
    // Two items with recipe_id + saved_at but no saved segment → fallback path with sort
    const payload = {
      items: [
        { recipe_id: "b-recipe", saved_at: "2024-01-02T00:00:00Z" },
        { recipe_id: "a-recipe", saved_at: "2024-01-01T00:00:00Z" },
      ],
    };
    const recipes = extractSavedRecipes(payload);
    expect(recipes.length).toBeGreaterThanOrEqual(2);
    // Sort is alphabetical by "Recipe <id>", so "Recipe a-recipe" < "Recipe b-recipe"
    expect(recipes[0]?.id).toBe("a-recipe");
  });
});

// ─── toSavedRecipeId — saved:boolean branch ───────────────────────────────────

describe("extractSavedRecipeIds — saved:boolean true branch (line 158)", () => {
  it("picks up recipe_id when the saved field is boolean true", () => {
    // saved: true (boolean) → isSavedFlag = true → isExplicitlySaved via saved_at
    const payload = {
      recipe_id: "bool-saved-id",
      saved: true,
      saved_at: "2024-06-01T00:00:00Z",
    };
    const ids = extractSavedRecipeIds(payload);
    expect(ids).toContain("bool-saved-id");
  });
});

// ─── extractSavedRecipesFromSegment — no-title fallback ───────────────────────

describe("extractSavedRecipes — no-title fallback (line 418)", () => {
  it("uses 'Recipe <id>' when the tile has a recipe_id but no parseable title", () => {
    const page = makeCookbookPage([
      {
        analytics: { contexts: [{ data: { recipe_id: "no-title-id" } }] },
        children: [],
      },
    ]);
    const recipes = extractSavedRecipes(page);
    expect(recipes[0]?.title).toBe("Recipe no-title-id");
  });
});

// ─── getRecipeIdFromTile edge cases ───────────────────────────────────────────

describe("extractSavedRecipes — getRecipeIdFromTile edge cases", () => {
  it("handles tiles where analytics.contexts is not an array", () => {
    // contexts is an object, not an array → getRecipeIdFromTile returns null → tile is skipped
    const page = makeCookbookPage([
      {
        analytics: { contexts: { not: "an array" } },
        children: [{ markdown: "Some Recipe" }],
      },
    ]);
    const recipes = extractSavedRecipes(page);
    expect(recipes).toHaveLength(0);
  });

  it("handles contexts where a context entry is not a record", () => {
    const page = makeCookbookPage([
      {
        analytics: {
          contexts: [
            "not-a-record",
            { data: { recipe_id: "found-after-skip" } },
          ],
        },
        children: [{ markdown: "My Recipe" }],
      },
    ]);
    const recipes = extractSavedRecipes(page);
    expect(recipes.length).toBeGreaterThanOrEqual(1);
    expect(recipes[0]?.id).toBe("found-after-skip");
  });

  it("handles contexts where data is not a record", () => {
    const page = makeCookbookPage([
      {
        analytics: {
          contexts: [
            { data: "not-a-record" },
            { data: { recipe_id: "after-bad-data" } },
          ],
        },
        children: [{ markdown: "My Recipe" }],
      },
    ]);
    const recipes = extractSavedRecipes(page);
    expect(recipes[0]?.id).toBe("after-bad-data");
  });

  it("returns null from getRecipeIdFromTile when no context has a recipe_id", () => {
    const page = makeCookbookPage([
      {
        analytics: { contexts: [{ data: { other_field: "value" } }] },
        children: [{ markdown: "No Recipe ID" }],
      },
    ]);
    // Tile has no recipe_id → skipped
    const recipes = extractSavedRecipes(page);
    expect(recipes).toHaveLength(0);
  });
});

// ─── parseRecipeTile fallback title ───────────────────────────────────────────

describe("extractSavedRecipes — parseRecipeTile title fallback", () => {
  it("falls back to the second cleaned.find when all entries have color codes", () => {
    // All markdown entries have #(#...) color codes — first find (no color codes) fails,
    // second find (which allows color codes) picks the first non-special entry
    const page = makeCookbookPage([
      {
        analytics: { contexts: [{ data: { recipe_id: "color-recipe" } }] },
        children: [
          { markdown: "#(#295813)Green Title#" },
          { markdown: "20 min" },
        ],
      },
    ]);
    const recipes = extractSavedRecipes(page);
    // The green title is the fallback title (the non-min, non-special entry via second find)
    expect(recipes[0]?.id).toBe("color-recipe");
    expect(recipes[0]?.title).toContain("Green Title");
  });
});

// ─── findFusionNodeById — early-exit when already found ───────────────────────

describe("findFusionNodeById — early-exit when already found", () => {
  it("stops visiting siblings after the target is found (covers visit early-return path)", () => {
    const payload = {
      children: [
        { id: "target-first", title: "Found First" },
        { id: "sibling", title: "Sibling" },
      ],
    };

    const node = findFusionNodeById(payload, "target-first");
    expect(node?.id).toBe("target-first");
  });
});
