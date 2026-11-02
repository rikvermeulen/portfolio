import type { PicnicRecipe } from "@/vendors/picnic/types.ts";

import { parseAccessibilityLabel, stripMarkdownDecorators } from "./image.ts";

// ─── Internal types ────────────────────────────────────────────────────────────

interface TraverseState {
  readonly path: readonly string[];
}

interface ParsedRecipeTile {
  readonly title?: string;
  readonly subtitle?: string;
  readonly dietaryLabel?: string;
  readonly hookText?: string;
  readonly availabilityNotice?: string;
  readonly timeText?: string;
  readonly servings?: number;
  readonly totalMinutes?: number;
  readonly accessibilityLabel?: string;
  readonly imageAssetId?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SAVED_RECIPES_SEGMENT_ID = "segment-control-list-SAVED_RECIPES";

// ─── Type guards ───────────────────────────────────────────────────────────────

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const readNullableString = (value: unknown): string | null | undefined => {
  if (value === null) {
    return null;
  }
  return readString(value);
};

// ─── Node finders ──────────────────────────────────────────────────────────────

function findNodeRawById(
  value: unknown,
  nodeId: string,
): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findNodeRawById(entry, nodeId);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }
  if (value.id === nodeId) {
    return value;
  }

  for (const entry of Object.values(value)) {
    const found = findNodeRawById(entry, nodeId);
    if (found) {
      return found;
    }
  }

  return null;
}

// ─── ID extraction ─────────────────────────────────────────────────────────────

function collectRecipeIds(value: unknown, recipeIds: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectRecipeIds(entry, recipeIds));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  if (
    typeof value.recipe_id === "string" &&
    value.recipe_id.trim().length > 0
  ) {
    recipeIds.add(value.recipe_id);
  }

  Object.values(value).forEach((entry) => collectRecipeIds(entry, recipeIds));
}

function toSavedRecipeId(
  value: Record<string, unknown>,
  path: readonly string[],
): string | null {
  const id = readString(value.recipe_id);
  if (!id) {
    return null;
  }

  const savedAt = readNullableString(value.saved_at);
  const isSavedFlag =
    typeof value.saved === "boolean"
      ? value.saved
      : typeof value.is_saved === "boolean"
        ? value.is_saved
        : null;

  const isInSavedSection = path.some((segment) =>
    segment.toLowerCase().includes("saved"),
  );

  const isExplicitlySaved = typeof savedAt === "string" && savedAt.length > 0;
  if (!isExplicitlySaved && isSavedFlag !== true && !isInSavedSection) {
    return null;
  }

  return isExplicitlySaved ? id : null;
}

/**
 * Extracts all saved recipe IDs from a Picnic cookbook Fusion page.
 *
 * First looks in the dedicated saved-recipes segment; falls back to a
 * full-payload scan for nodes with a `saved_at` timestamp.
 */
export function extractSavedRecipeIds(payload: unknown): readonly string[] {
  const savedSegment = findNodeRawById(payload, SAVED_RECIPES_SEGMENT_ID);

  if (savedSegment) {
    const ids = new Set<string>();
    collectRecipeIds(savedSegment, ids);
    if (ids.size > 0) {
      return [...ids.values()];
    }
  }

  const recipeIds = new Set<string>();
  const visit = (value: unknown, state: TraverseState): void => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) =>
        visit(entry, { path: [...state.path, `[${index}]`] }),
      );
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    const maybeId = toSavedRecipeId(value, state.path);
    if (maybeId) {
      recipeIds.add(maybeId);
    }

    Object.entries(value).forEach(([key, entry]) => {
      visit(entry, { path: [...state.path, key] });
    });
  };

  visit(payload, { path: [] });
  return [...recipeIds.values()];
}

// ─── Tile parsing ──────────────────────────────────────────────────────────────

function getRecipeIdFromTile(value: Record<string, unknown>): string | null {
  const analytics = value.analytics;
  if (!isRecord(analytics)) {
    return null;
  }

  const contexts = analytics.contexts;
  if (!Array.isArray(contexts)) {
    return null;
  }

  for (const context of contexts) {
    if (!isRecord(context)) {
      continue;
    }
    const data = context.data;
    if (!isRecord(data)) {
      continue;
    }
    const recipeId = readString(data.recipe_id);
    if (recipeId) {
      return recipeId;
    }
  }

  return null;
}

function collectMarkdownValues(
  value: unknown,
  output: string[] = [],
): string[] {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectMarkdownValues(entry, output));
    return output;
  }

  if (!isRecord(value)) {
    return output;
  }

  if (typeof value.markdown === "string") {
    output.push(value.markdown);
  }

  Object.values(value).forEach((entry) => collectMarkdownValues(entry, output));
  return output;
}

function findFirstStringByKey(value: unknown, key: string): string | undefined {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findFirstStringByKey(entry, key);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }
  if (typeof value[key] === "string") {
    return value[key] as string;
  }

  for (const entry of Object.values(value)) {
    const found = findFirstStringByKey(entry, key);
    if (found) {
      return found;
    }
  }

  return undefined;
}

function findFirstRecipeImageAssetId(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findFirstRecipeImageAssetId(entry);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const source = value.source;
  if (
    isRecord(source) &&
    typeof source.id === "string" &&
    source.id.startsWith("recipes/")
  ) {
    return source.id;
  }

  for (const entry of Object.values(value)) {
    const found = findFirstRecipeImageAssetId(entry);
    if (found) {
      return found;
    }
  }

  return undefined;
}

function parseRecipeTile(value: unknown): ParsedRecipeTile {
  const markdownValues = collectMarkdownValues(value);
  const cleaned = markdownValues
    .map((raw) => ({ raw, text: stripMarkdownDecorators(raw) }))
    .filter((entry) => entry.text.length > 0);

  const availabilityNotice = cleaned.find(
    (entry) => entry.text === "Niet alles op voorraad",
  )?.text;
  const dietaryLabel = cleaned.find((entry) =>
    entry.raw.includes("#(#ffffff)"),
  )?.text;
  const hookText = cleaned.find((entry) =>
    entry.raw.includes("#(#295813)"),
  )?.text;
  const timeText = cleaned.find((entry) => /\bmin\b/i.test(entry.text))?.text;

  const title =
    cleaned.find(
      (entry) =>
        !entry.raw.includes("#(#") &&
        entry.text !== "Toevoegen" &&
        entry.text !== "Niet alles op voorraad" &&
        !/\bmin\b/i.test(entry.text),
    )?.text ??
    cleaned.find(
      (entry) =>
        entry.text !== "Toevoegen" &&
        entry.text !== "Niet alles op voorraad" &&
        !/\bmin\b/i.test(entry.text),
    )?.text;

  const accessibilityLabel = findFirstStringByKey(value, "accessibilityLabel");
  const { servings, totalMinutes } =
    parseAccessibilityLabel(accessibilityLabel);

  return {
    title,
    subtitle: hookText ?? dietaryLabel ?? availabilityNotice,
    dietaryLabel,
    hookText,
    availabilityNotice,
    timeText,
    servings,
    totalMinutes,
    accessibilityLabel: accessibilityLabel ?? undefined,
    imageAssetId: findFirstRecipeImageAssetId(value) ?? undefined,
  };
}

// ─── Main extraction ───────────────────────────────────────────────────────────

function extractSavedRecipesFromSegment(
  payload: unknown,
): readonly PicnicRecipe[] {
  const savedSegment = findNodeRawById(payload, SAVED_RECIPES_SEGMENT_ID);
  if (!savedSegment) {
    return [];
  }

  const recipes = new Map<string, PicnicRecipe>();

  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    const recipeId = getRecipeIdFromTile(value);
    if (recipeId && !recipes.has(recipeId)) {
      const parsed = parseRecipeTile(value);
      const deeplink = readString(
        (
          value as {
            pml?: { component?: { onPress?: { target?: unknown } } };
          }
        ).pml?.component?.onPress?.target,
      );

      recipes.set(recipeId, {
        id: recipeId,
        title: parsed.title ?? `Recipe ${recipeId}`,
        subtitle: parsed.subtitle,
        deeplink,
        dietaryLabel: parsed.dietaryLabel,
        hookText: parsed.hookText,
        availabilityNotice: parsed.availabilityNotice,
        timeText: parsed.timeText,
        servings: parsed.servings,
        totalMinutes: parsed.totalMinutes,
        accessibilityLabel: parsed.accessibilityLabel,
        imageAssetId: parsed.imageAssetId,
      });
    }

    Object.values(value).forEach(visit);
  };

  visit(savedSegment);
  return [...recipes.values()];
}

/**
 * Extracts saved recipes from a Picnic cookbook Fusion page, sorted
 * alphabetically by title.
 *
 * Tries the enriched tile-parsing path first (full metadata including images).
 * Falls back to a minimal ID-only list when the saved-recipes segment is absent.
 */
export function extractSavedRecipes(payload: unknown): readonly PicnicRecipe[] {
  const fromSegment = extractSavedRecipesFromSegment(payload);

  if (fromSegment.length > 0) {
    return [...fromSegment].sort((a, b) => a.title.localeCompare(b.title));
  }

  return extractSavedRecipeIds(payload)
    .map((id): PicnicRecipe => ({ id, title: `Recipe ${id}` }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
