"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <main>
          <h1>Something went wrong!</h1>
          <p>An unexpected error occurred. Please try again.</p>
          <button onClick={() => reset()} type="button">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
