import { BentoGrid, bentoGridConfig } from "@/components/Bento/index.ts";
import { SpotifyConnectionProvider } from "@/contexts/SpotifyConnectionContext/index.ts";

/**
 * Dashboard layout. The grid is composed entirely from `bento-registry.tsx`
 * via `page.tsx` (the `children` slot) — there are no parallel-route slots.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SpotifyConnectionProvider>
      <main className="main-container">
        <BentoGrid config={bentoGridConfig}>{children}</BentoGrid>
      </main>
    </SpotifyConnectionProvider>
  );
}
