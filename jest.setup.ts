// Next.js data-cache helpers are a runtime concern, not something unit tests
// should exercise. Make `unstable_cache` a pass-through so service tests call
// the underlying data functions directly and stay isolated from one another
// (the real implementation memoizes by key, which would leak state across
// test cases).
jest.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));
