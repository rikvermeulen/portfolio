import Image from "next/image";
import Link from "next/link";

import LiveTime from "@/components/LiveTime/index.ts";

export default function Header() {
  return (
    <header className="py-10">
      <div className="main-container flex w-full justify-between">
        <Link
          aria-label="Rik Vermeulen — home"
          href="/"
          className="focus-ring flex items-center gap-2 justify-self-start rounded-sm text-black dark:text-white"
        >
          <Image
            alt=""
            height="20"
            src="/images/logo.png"
            width="20"
            className="size-6 dark:invert"
          />
          <p className="hidden text-xs font-normal sm:block md:text-sm">
            Rik Vermeulen
          </p>
        </Link>
        <p className="text-sm font-normal text-black dark:text-white">
          <LiveTime />
        </p>
      </div>
    </header>
  );
}
