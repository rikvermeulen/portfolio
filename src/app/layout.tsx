import "@/styles/globals.css";

import dynamic from "next/dynamic";

import type { Metadata, Viewport } from "next";

import TWBreakpointIndicator from "@/components/_dev/TWBreakpointIndicator/TWBreakpointIndicator.tsx";
import { AnimationProvider } from "@/contexts/AnimationContext/AnimationContext.tsx";
import { fontInter } from "@/lib/fonts/fonts.ts";
import Header from "@/modules/Navigation/Header/Header.tsx";
import { env } from "@env";

const ReactScan = dynamic(
  () => import("@/components/_dev/ReactScan/ReactScan.tsx"),
);

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
      <body className={`${fontInter.variable} font-inter antialiased`}>
        <AnimationProvider>
          {env.NODE_ENV === "development" && <ReactScan />}
          <Header />
          {children}
          <TWBreakpointIndicator />
        </AnimationProvider>
      </body>
    </html>
  );
}
