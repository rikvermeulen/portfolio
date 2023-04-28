import "@/styles/global.css";
import meta from "@/app/meta";
import Header from "@/components/Header";
import { fontSans } from "@/lib/fonts";
import type { RootLayoutProps } from "@/types/index";
import type { Metadata } from "next";

/**
 * generateMetadata is a function that returns a promise of Metadata.
 * @see https://beta.nextjs.org/docs/guides/seo#dynamic-metadata
 * @returns {Promise<Metadata>}
 */

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await meta();
  return metadata;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${fontSans.variable}`}>
      <body>
        <div className="fixed -z-0 h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-100" />
        <Header />
        {children}
      </body>
    </html>
  );
}
