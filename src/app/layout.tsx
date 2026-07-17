import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";

import TWBreakpointIndicator from "@/components/_dev/TWBreakpointIndicator/index.ts";
import JsonLd from "@/components/JsonLd/index.ts";
import SkipLink from "@/components/SkipLink/index.ts";
import { ToastProvider } from "@/components/Toast/index.ts";
import { AnimationProvider } from "@/contexts/AnimationContext/AnimationContext.tsx";
import { fontInter } from "@/lib/fonts/fonts.ts";
import { buildMetadata, siteStructuredData } from "@/lib/seo/index.ts";
import Footer from "@/modules/Footer/index.ts";
import Header from "@/modules/Header/index.ts";

export const metadata: Metadata = buildMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fontInter.variable} font-inter antialiased dark:bg-black dark:text-white`}
      >
        <JsonLd data={siteStructuredData()} />
        <AnimationProvider>
          <SkipLink />
          <Header />
          {children}
          <Footer />
          <ToastProvider />
          <TWBreakpointIndicator />
        </AnimationProvider>
      </body>
    </html>
  );
}
