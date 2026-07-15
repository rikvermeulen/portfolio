import type { SocialLink } from "./socials.types.ts";

/**
 * Shared social links — the single source of truth consumed by both the Contact
 * tile (icon menu) and the site Footer (text links). `icon` maps to
 * `/images/icons/socials/{icon}.png`.
 */
export const socials: readonly SocialLink[] = [
  {
    name: "Twitter",
    icon: "twitter",
    url: "https://twitter.com/rikvermeulen_",
  },
  {
    name: "Github",
    icon: "github",
    url: "https://github.com/rikvermeulen",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    url: "https://www.linkedin.com/in/rik-vermeulen/",
  },
];
