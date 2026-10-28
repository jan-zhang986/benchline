"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <h1 className="text-4xl tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The page failed to render. Retry, or run a new check from the homepage.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
