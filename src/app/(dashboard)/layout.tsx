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
  photos,
}: {
  children: React.ReactNode;
  personal: React.ReactNode;
  photos: React.ReactNode;
}) {
  return (
    <main className="main-container grid grid-cols-8">
      {personal}
      {photos}
      {children}
    </main>
  );
}
