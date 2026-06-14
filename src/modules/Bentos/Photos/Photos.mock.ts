import type { PhotosProps } from "./Photos.types.ts";

export const mockPhotosProps = {
  albums: {
    apps: ["/images/me.jpg", "/images/profile.png"],
    map: ["/images/cloud.png"],
    heart: ["/images/book-image.png"],
    dog: ["/images/noalbum.png"],
  },
} satisfies PhotosProps;
