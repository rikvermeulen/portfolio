import Image from "next/image";

import Link from "@/components/Link/Link.tsx";

const Personal = () => {
  return (
    <div className="col-span-6">
      <Image
        alt="Portrait of Rik Vermeulen"
        height="184"
        src="/images/me.jpg"
        width="184"
        className="w-40 rounded-full 2xl:w-auto"
      />
      <div className="pt-8">
        <h2 className="flex gap-2 text-xl font-bold md:text-3xl">
          Hey hey, I’m Rik <div className="shake w-fit cursor-pointer"> 👋🏻</div>
        </h2>
        <p className="max-w-xl pt-3 text-dark-grey">
          I’m a Creative Developer based in Heukelum, the Netherlands. I develop
          full-scale creative digital experiences for some amazing agencies and
          hugely talented people. ✨
        </p>
      </div>
      <div className="hidden pt-6 2xl:block">
        <p className="text-dark_grey pt-2 md:text-xl">
          🐙 Coding:&nbsp;
          <Link
            href="https://github.com/rikvermeulen"
            className="decoration-1 underline-offset-2 transition-colors hover:text-[#007AFF] hover:underline"
          >
            @rikvermeulen
          </Link>
        </p>
        <p className="text-dark_grey pt-1 md:text-xl">
          💌 Hello?&nbsp;
          <Link
            href="mailto:hello@rikvermeulen.com"
            className="decoration-1 underline-offset-2 transition-colors hover:text-[#007AFF] hover:underline"
          >
            hello@rikvermeulen.com
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Personal;
