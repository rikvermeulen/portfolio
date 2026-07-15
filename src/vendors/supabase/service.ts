import { unstable_cache } from "next/cache";

import type { PhotoAlbums } from "@/lib/photos/types.ts";
import type { Result } from "@/types/index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

import { compact } from "@/utils/compact/index.ts";
import { env } from "@env";

import { createSupabaseClient } from "./client.ts";

const PHOTOS_BUCKET = "photos" as const;

/** Album names to fetch from storage, in display order. */
const ALBUMS = ["apps", "map", "heart", "dog"] as const;

/**
 * Fetches all public photo URLs for a single album. `getPublicUrl` is
 * synchronous in supabase-js v2 (pure string building, no network), so it maps
 * directly without extra async overhead.
 */
async function fetchAlbumPhotos(
  supabase: SupabaseClient,
  albumName: string,
): Promise<readonly string[]> {
  const { data } = await supabase.storage.from(PHOTOS_BUCKET).list(albumName);

  if (!data || data.length === 0) {
    return [];
  }

  return compact(
    data.map(
      (file) =>
        supabase.storage
          .from(PHOTOS_BUCKET)
          .getPublicUrl(`${albumName}/${file.name}`).data?.publicUrl,
    ),
  );
}

async function fetchAllAlbums(): Promise<PhotoAlbums> {
  const supabase = createSupabaseClient();

  const albums = await Promise.all(
    ALBUMS.map(
      async (name) => [name, await fetchAlbumPhotos(supabase, name)] as const,
    ),
  );

  return Object.fromEntries(albums);
}

/**
 * Cached album listings. The `list` calls are real network round trips with no
 * Next cache integration, so without this all albums hit Supabase on every
 * dashboard render. Photos change rarely → 24h. The wrapped fn throws on
 * failure so errors aren't cached (mirrors the Steam/Planta services).
 */
const getCachedAlbums = unstable_cache(fetchAllAlbums, ["supabase-photos"], {
  revalidate: 86400,
  tags: ["photos"],
});

export async function getPhotosResult(): Promise<Result<PhotoAlbums>> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return { ok: false, errorMessage: "Photos are not configured" };
  }

  try {
    const albums = await getCachedAlbums();

    if (Object.values(albums).every((urls) => urls.length === 0)) {
      return { ok: false, errorMessage: "No photos found" };
    }

    return { ok: true, data: albums };
  } catch (error) {
    console.error("[supabase] getPhotosResult failed:", error);
    return { ok: false, errorMessage: "Could not load photos right now" };
  }
}
