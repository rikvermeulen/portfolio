import type { AppIconProps } from "./AppIcon.types.ts";

export const mockAppIconProps = {
  alt: "Music",
  darkSrc: "/images/icons/dark/music.png",
  src: "/images/icons/light/music.png",
} satisfies AppIconProps;

export const mockAppIconLightOnlyProps = {
  alt: "Rik Vermeulen",
  src: "/images/me.jpg",
} satisfies AppIconProps;

export const mockAppIconInteractiveProps = {
  ...mockAppIconProps,
  interactive: true,
} satisfies AppIconProps;
