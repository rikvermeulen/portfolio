import Image from "next/image";
import Link from "next/link";

import LiveTime from "@/components/LiveTime/LiveTime.tsx";

export default function Header() {
  return (
    <header className="py-10">
      <div className="main-container flex w-full justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 justify-self-start text-black"
        >
          <Image alt="logo" height="20" src="/images/logo.png" width="20" />
          <p className="hidden text-xs font-normal sm:block md:text-sm">
            Rik Vermeulen
          </p>
        </Link>
        <p className="text-sm font-normal text-black">
          <LiveTime />
        </p>
      </div>
    </header>
  );
}
