import { SpotifyConnectionProvider } from "@/contexts/SpotifyConnectionContext/index.ts";
import Hero from "@/modules/Hero/index.ts";
import Navigation from "@/modules/Navigation/index.ts";

/**
 * Dashboard layout. The page is structured top-to-bottom: a full-width Hero, a
 * Navigation toggle row, then the bento sections (composed from
 * `bento-registry.tsx` via `page.tsx` — the `children` slot). Each section grid
 * carries the anchor (`#about`, `#work`, `#education`) Navigation jumps to.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SpotifyConnectionProvider>
      <main id="main" className="main-container">
        <div className="mb-20 flex flex-col gap-12">
          <Hero />
          <Navigation />
        </div>
        {children}
      </main>
    </SpotifyConnectionProvider>
  );
}
