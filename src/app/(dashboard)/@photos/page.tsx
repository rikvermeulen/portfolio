import { createSupabaseClient } from "@/lib/supabase/supabase.ts";
import { Photos } from "@/modules/Bentos/index.ts";

/**
 * Album configuration with name identifier
 */
interface AlbumConfig {
  readonly name: string;
}

/**
 * Album data with fetched photo URLs
 */
interface AlbumData {
  readonly name: string;
  readonly urls: readonly string[];
}

/**
 * Storage bucket name for photos
 */
const PHOTOS_BUCKET = "photos" as const;

/**
 * Album names to fetch from storage
 */
const ALBUMS: readonly AlbumConfig[] = [
  { name: "apps" },
  { name: "map" },
  { name: "heart" },
  { name: "dog" },
] as const;

/**
 * Fetches all photo URLs for a given album from Supabase storage
 *
 * @param albumName - The name of the album to fetch photos from
 * @returns Array of public URLs for photos in the album
 * @throws Error if the album cannot be fetched from storage
 */
async function fetchAlbumPhotos(albumName: string): Promise<readonly string[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase.storage.from(PHOTOS_BUCKET).list(albumName);

  if (!data || data.length === 0) {
    return [];
  }

  const urlPromises = data.map(async (file) => {
    const fullPath = `${albumName}/${file.name}`;
    const { data: urlData } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .getPublicUrl(fullPath);

    return urlData?.publicUrl;
  });

  const urls = await Promise.all(urlPromises);

  return urls.filter((url): url is string => Boolean(url));
}

/**
 * Fetches photos for all configured albums in parallel
 *
 * @returns Record mapping album names to their photo URLs
 */
async function fetchAllAlbums(): Promise<Record<string, readonly string[]>> {
  const albumPromises = ALBUMS.map(async (album): Promise<AlbumData> => {
    const urls = await fetchAlbumPhotos(album.name);
    return { name: album.name, urls };
  });

  const albums = await Promise.all(albumPromises);

  return Object.fromEntries(albums.map((album) => [album.name, album.urls]));
}

/**
 * Photos page component that fetches and displays photos from Supabase storage
 *
 * @returns The Photos component with fetched album data
 */
export default async function PhotosPage() {
  const albums = await fetchAllAlbums();

  return <Photos albums={albums} />;
}
