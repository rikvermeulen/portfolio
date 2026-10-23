import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { PhotoAlbums } from "@/lib/photos/types.ts";

export interface PhotosProps extends BentoSizedProps {
  /** Album name → ordered media URLs, keyed in display order. */
  readonly albums: PhotoAlbums;
}
