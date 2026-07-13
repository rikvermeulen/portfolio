import type { PhotosProps } from "./Photos.types.ts";

export const mockPhotosProps = {
  sizeKey: "photos",
  albums: {
    apps: ["/images/me.jpg", "/images/profile.png"],
    map: ["/images/cloud.png"],
    heart: ["/images/profile.png"],
    dog: ["/images/no-album.png"],
  },
} satisfies PhotosProps;
