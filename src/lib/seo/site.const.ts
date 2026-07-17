import { socials } from "@/lib/socials/index.ts";

export const SITE = {
  name: "Rik Vermeulen",
  shortName: "Rik",
  jobTitle: "Creative Developer",
  title: "Rik Vermeulen — Creative Developer",
  description:
    "Creative Developer based in Rotterdam, the Netherlands. Building full-scale creative digital experiences for agencies and talented people.",
  url: "https://rikvermeulen.com",
  locale: "en_US",
  twitterHandle: "@rikvermeulen_",
  location: {
    city: "Rotterdam",
    region: "South Holland",
    country: "the Netherlands",
    countryCode: "NL",
  },
  email: "hello@rikvermeulen.com",
  image: "/images/me.jpg",
  knowsAbout: [
    "Creative Development",
    "Frontend Development",
    "Next.js",
    "React",
    "TypeScript",
  ],
  keywords: [
    "Rik Vermeulen",
    "Creative Developer",
    "Frontend Developer",
    "Web Developer",
    "Rotterdam",
    "Netherlands",
    "Portfolio",
    "Next.js",
    "React",
    "Creative Development",
  ],
} as const;

export const SITE_SAME_AS: readonly string[] = socials.map(
  (social) => social.url,
);
