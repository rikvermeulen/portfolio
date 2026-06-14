import type { IMessage, SocialLink } from "./Contact.types.ts";

export const CHAT_SENDER = {
  name: "Rik",
  avatarSrc: "/images/profile.png",
  avatarAlt: "Rik Vermeulen",
} as const;

export const INITIAL_MESSAGE_ID_PREFIX = "init-";

export const MESSAGE_VARIANT = {
  incoming: {
    bubble: "bg-[#E9E9EB]",
    tailFill: "fill-[#E9E9EB]",
    tailPosition: "absolute bottom-0.5 -left-1 size-4 -scale-x-100",
  },
  outgoing: {
    bubble: "bg-[#007AFF] text-white",
    tailFill: "fill-[#007AFF]",
    tailPosition: "absolute -right-1 bottom-0.5 size-4",
  },
} as const;

export const initialMessages: readonly IMessage[] = [
  {
    id: "init-0",
    sender: "admin",
    text: "Want to work together? just want to chat? send me a text here (no, for real)",
  },
  { id: "init-1", sender: "user", text: "Sounds good 🙏" },
];

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
  {
    name: "Mail",
    icon: "gmail",
    url: "mailto:rik.vermeulen@greenberry.nl",
  },
];
