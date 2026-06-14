import { BentoGrid, bentoGridConfig } from "@/components/Bento/index.ts";

/**
 * Dashboard layout with parallel routes support.
 * Each slot (@photos, etc.) renders independently and can be extended
 * with additional modules in the future.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
 */
export default function Layout({
  children,
  personal,
  contact,
  music,
  podcast,
  photos,
  plants,
  recipes,
}: {
  children: React.ReactNode;
  personal: React.ReactNode;
  contact: React.ReactNode;
  music: React.ReactNode;
  podcast: React.ReactNode;
  photos: React.ReactNode;
  plants: React.ReactNode;
  recipes: React.ReactNode;
}) {
  return (
    <main className="main-container">
      <BentoGrid config={bentoGridConfig}>
        {personal}
        {photos}
        {plants}
        {music}
        {podcast}
        {contact}
        {recipes}
        {children}
      </BentoGrid>
    </main>
  );
}
