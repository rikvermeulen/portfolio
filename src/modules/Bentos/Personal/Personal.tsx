import Image from "next/image";

import Bento, { bentoBoxSizes } from "@/components/Bento/index.ts";
import Link from "@/components/Link/index.ts";

const Personal = () => {
  return (
    <Bento sizes={bentoBoxSizes.personal} className="size-full">
      <Image
        alt="Portrait of Rik Vermeulen"
        height="184"
        src="/images/me.jpg"
        width="184"
        className="h-auto w-40 rounded-full 2xl:w-auto"
      />
      <div className="pt-8">
        <h2 className="flex gap-2 text-xl font-bold md:text-3xl">
          Hey hey, I’m Rik{" "}
          <span className="shake w-fit cursor-pointer">👋🏻</span>
        </h2>
        <p className="max-w-xl pt-3 text-ds-gray">
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
            className="decoration-1 underline-offset-2 transition-colors hover:text-ds-blue hover:underline"
          >
            @rikvermeulen
          </Link>
        </p>
        <p className="text-ds-gray">
          💌 Hello?&nbsp;
          <Link
            href="mailto:hello@rikvermeulen.com"
            className="decoration-1 underline-offset-2 transition-colors hover:text-ds-blue hover:underline"
          >
            hello@rikvermeulen.com
          </Link>
        </p>
      </div>
    </Bento>
  );
};

export default Personal;
