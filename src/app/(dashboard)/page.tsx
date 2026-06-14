import type { Metadata } from "next";

import {
  Category,
  FindMe,
  Image,
  Information,
} from "@/modules/Bentos/index.ts";

export const metadata: Metadata = {
  title: "Home - Rik Vermeulen Portfolio",
  description:
    "Rik Vermeulen - Creative Developer based in Rotterdam, the Netherlands. Explore Rik’s digital portfolio and the creative experiences he has developed through the years.",
};

export default function Home() {
  return (
    <>
      <Category tags={[{ label: "About me", variant: "yellow" }]} />
      <FindMe />
      <div aria-hidden className="bentogrid-section-break" />
      <Category
        tags={[
          { label: "Work", variant: "green" },
          { label: "2023 - current", variant: "blue" },
        ]}
      />
      <Information
        description="Building polished digital experiences together with a talented team."
        href="https://greenberry.nl"
        iconPosition="top-right"
        iconSrc="/images/icons/greenberry.png"
        linkLabel="Current role"
        title="Medior Front-end engineer at Greenberry"
        className="bg-[#5801ff] text-[#fff]"
      />
      <Image
        alt="Portrait of Rik Vermeulen"
        caption="Team moments and product thinking."
        src="/images/me.jpg"
        className="bg-[#DFF5E7] text-[#143224]"
      />
    </>
  );
}
