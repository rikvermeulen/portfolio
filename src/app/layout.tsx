import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";

import TWBreakpointIndicator from "@/components/_dev/TWBreakpointIndicator/index.ts";
import { ToastProvider } from "@/components/Toast/index.ts";
import { AnimationProvider } from "@/contexts/AnimationContext/AnimationContext.tsx";
import { fontInter } from "@/lib/fonts/fonts.ts";
import Header from "@/modules/Navigation/Header/index.ts";

export const metadata: Metadata = {
  title: "Rik Vermeulen — Creative Developer",
  description:
    "Creative Developer based in Heukelum, the Netherlands. Building full-scale digital experiences.",
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
          <Header />
          {children}
          <ToastProvider />
          <TWBreakpointIndicator />
        </AnimationProvider>
      </body>
    </html>
  );
}
