/**
 * Static tile *content* — the copy, links, colors, and tags for the dashboard's
 * non-data tiles. Kept out of `bento-registry.tsx` so that file stays pure
 * order/wiring; this is the place to edit words, images, and section styling.
 * `sizeKey` is omitted here — the registry threads it into each tile.
 */
import type {
  CategoryProps,
  ImageProps,
  InformationProps,
} from "@/modules/Bentos/index.ts";

import { bentos } from "@/components/Bento/index.ts";

type CategoryContent = Omit<CategoryProps, "sizeKey">;
type InformationContent = Omit<InformationProps, "sizeKey">;
type ImageContent = Omit<ImageProps, "sizeKey">;

/** Section header tags, keyed by the section each `Category` tile heads. */
export const categoryContent = {
  about: {
    tags: [{ label: "About me", variant: "yellow" }],
  },
  work: {
    tags: [
      { label: "Work", variant: "green" },
      { label: "2023 - current", variant: "blue" },
    ],
  },
  education: {
    tags: [
      { label: "Education", variant: "lavender" },
      { label: "2019 - 2023", variant: "blue" },
    ],
  },
} satisfies Record<string, CategoryContent>;

/** Copy + link for each `Information` tile. */
export const informationContent = {
  work: {
    title: "Medior Front-end engineer at Greenberry",
    description:
      "Building polished digital experiences together with a talented team.",
    href: "https://greenberry.nl",
    linkLabel: "Current role",
    iconSrc: bentos.greenberry.icon,
    iconPosition: "top-right",
    className: "bg-ds-violet text-white",
  },
  education: {
    title: "Hogeschool Rotterdam",
    description:
      "Where I built my foundation in design and front-end development.",
    href: "https://www.hogeschoolrotterdam.nl",
    linkLabel: "Education",
    iconPosition: "top-right",
    className: "text-[#d3104c]",
    surfaceClassName: "bg-[#f7efe3]",
  },
} satisfies Record<string, InformationContent>;

/** Source + framing for each `Image` tile. */
export const imageContent = {
  work: {
    src: "/images/me.jpg",
    alt: "Portrait of Rik Vermeulen",
    caption: "Team moments and product thinking.",
    className: "bg-ds-mint text-ds-mint-ink",
  },
  education: {
    src: "/images/school/hogeschool-rotterdam-logo.svg",
    alt: "Hogeschool Rotterdam logo",
    caption: "Time flies",
    fit: "contain",
    className: "text-[#f7efe3]",
    surfaceClassName: "bg-[#d3104c]",
  },
} satisfies Record<string, ImageContent>;
