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
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Please try loading this page again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
