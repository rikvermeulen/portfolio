import type { Result } from "@/types/index.ts";

interface AsyncBentoProps<T> {
  readonly load: () => Promise<Result<T>>;
  readonly render: (data: T) => React.ReactNode;
  readonly renderError: (errorMessage: string) => React.ReactNode;
}

/**
 * Awaits a service `Result` and renders success or the expected error state.
 * The single home for the `await getXResult(); if (!ok) …` branch that was
 * copy-pasted across every dashboard data route. Rendered inside a `<Suspense>`
 * boundary so the fetch streams independently per tile.
 */
async function AsyncBento<T>({
  load,
  render,
  renderError,
}: AsyncBentoProps<T>): Promise<React.ReactNode> {
  const result = await load();
  return result.ok ? render(result.data) : renderError(result.errorMessage);
}

export default AsyncBento;
