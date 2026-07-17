"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="relative z-10 mx-auto w-full max-w-3xl py-24">
      <h1 className="text-xl">Something went wrong!</h1>
      <p>An unexpected error occurred. Please try again.</p>
      <button onClick={() => reset()} type="button">
        Try again
      </button>
    </main>
  );
}
