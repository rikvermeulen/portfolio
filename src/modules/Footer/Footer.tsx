import Image from "next/image";

import Link from "@/components/Link/index.ts";
import { socials } from "@/lib/socials/index.ts";

const isMail = (url: string) => url.startsWith("mailto:");

const YEAR = new Date().getFullYear();

/**
 * Site footer — a clean, spacious close to the page: a small logo (header-sized)
 * on the left and a "Links" column on the right (external socials with an arrow,
 * the email as plain text, and the copyright line).
 */
export default function Footer() {
  const links = socials.filter((social) => !isMail(social.url));

  return (
    <footer className="main-container mt-16 pb-16 md:mt-24">
      <div className="content-container flex flex-col gap-10 border-t border-ds-border pt-12 md:flex-row md:justify-between">
        <Link aria-label="Rik Vermeulen — home" href="/" className="w-fit">
          <Image
            alt="logo"
            height="24"
            src="/images/logo.png"
            width="24"
            className="size-6"
          />
        </Link>

        <div className="flex flex-col gap-3">
          <h2 className="font-medium text-black dark:text-white">Links</h2>
          <ul className="flex flex-col gap-1.5">
            {links.map(({ name, url }) => (
              <li key={name}>
                <Link
                  href={url}
                  className="cursor-pointer text-ds-gray decoration-1 underline-offset-2 transition-colors hover:text-ds-blue hover:underline"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ds-gray">© {YEAR} Rik Vermeulen</p>
        </div>
      </div>
    </footer>
  );
}
