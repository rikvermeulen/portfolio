import "@/styles/globals.css";

import dynamic from "next/dynamic";

import type { Metadata, Viewport } from "next";

import TWBreakpointIndicator from "@/components/_dev/TWBreakpointIndicator/index.ts";
import { AnimationProvider } from "@/contexts/AnimationContext/AnimationContext.tsx";
import { fontInter } from "@/lib/fonts/fonts.ts";
import Header from "@/modules/Navigation/Header/index.ts";

const ReactScan = dynamic(() => import("@/components/_dev/ReactScan/index.ts"));

export const metadata: Metadata = {
  title: "Next.js",
};

export const viewport: Viewport = {
  themeColor: "black",
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
        <AnimationProvider>
          <ReactScan />
          <Header />
          {children}
          <TWBreakpointIndicator />
        </AnimationProvider>
      </body>
    </html>
  );
}
