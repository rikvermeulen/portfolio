import type { ImageProps } from "./Image.types.ts";

export const mockImageProps = {
  src: "/images/me.jpg",
  alt: "Portrait of Rik Vermeulen",
  caption: "Team moments and product thinking.",
  className: "bg-ds-mint text-ds-mint-ink",
} satisfies ImageProps;
