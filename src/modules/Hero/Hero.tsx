import Image from "next/image";

import Link from "@/components/Link/index.ts";

/**
 * Site hero — the personal intro, lifted out of the bento grid into its own
 * section above it. Keeps the original Personal tile's markup and styling
 * untouched; only the surrounding container is narrower than the grid.
 */
export default function Hero() {
  return (
    <section className="content-container flex flex-col gap-4">
      <Image
        alt="Portrait of Rik Vermeulen"
        height="184"
        priority
        src="/images/me.jpg"
        width="184"
        className="h-auto w-32 max-w-32 rounded-full"
      />
      <div className="flex flex-col gap-2">
        <h1 className="flex gap-2 text-xl font-bold md:text-3xl">
          Hey hey, I’m Rik{" "}
          <span className="shake w-fit cursor-pointer">👋🏻</span>
        </h1>
        <p className="max-w-xl text-ds-gray">
          I’m a Creative Developer based in Heukelum, the Netherlands. I develop
          full-scale creative digital experiences for some amazing agencies and
          hugely talented people. ✨
        </p>
      </div>
      <div>
        <p className="text-ds-gray">
          🐙 Coding:&nbsp;
          <Link
            href="https://github.com/rikvermeulen"
            className="cursor-pointer decoration-1 underline-offset-2 transition-colors hover:text-ds-blue hover:underline"
          >
            @rikvermeulen
          </Link>
        </p>
        <p className="text-ds-gray">
          💌 Hello?&nbsp;
          <Link
            href="mailto:hello@rikvermeulen.com"
            className="cursor-pointer decoration-1 underline-offset-2 transition-colors hover:text-ds-blue hover:underline"
          >
            hello@rikvermeulen.com
          </Link>
        </p>
      </div>
    </section>
  );
}
