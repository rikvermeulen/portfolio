import Link from "next/link";

import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo/index.ts";

export const metadata: Metadata = buildPageMetadata({
  title: "Page not found",
});

export default function NotFound() {
  return (
    <main id="main" className="relative z-10 mx-auto w-full max-w-3xl py-24">
      <h1 className="text-xl">Not Found</h1>
      <p>Could not find requested resource</p>
      <p>
        Lets return to the <Link href="/">homepage</Link>
      </p>
    </main>
  );
}
