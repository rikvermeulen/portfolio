import { SpotifyConnectionProvider } from "@/contexts/SpotifyConnectionContext/index.ts";
import BentoGrid, { bentoGridConfig } from "@/modules/BentoGrid/index.ts";
import Hero from "@/modules/Hero/index.ts";
import Navigation from "@/modules/Navigation/index.ts";

/**
 * Dashboard layout. The page is structured top-to-bottom: a full-width Hero, a
 * Navigation toggle row, then the bento grid (composed from `bento-registry.tsx`
 * via `page.tsx` — the `children` slot). The grid carries the `#about` anchor
 * that the Navigation "About me" chip jumps to.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SpotifyConnectionProvider>
      <main className="main-container pt-4 md:pt-8">
        <Hero />
        <Navigation />
        <BentoGrid id="about" config={bentoGridConfig} className="scroll-mt-24">
          {children}
        </BentoGrid>
      </main>
    </SpotifyConnectionProvider>
  );
}
