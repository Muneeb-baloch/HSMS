"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import { useEffect } from "react";
import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Global System Error | HSMS</title>
      </head>
      <body className="min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white antialiased">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/20 p-8 backdrop-blur-xl shadow-2xl shadow-red-900/20">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <IconAlertTriangle
                  className="size-20 text-red-400/90 animate-pulse"
                  aria-hidden
                />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
                Global System Error
              </h1>
              <p className="mb-6 text-white/70">
                Something went wrong at the application level. Please try again.
              </p>
              {error.digest && (
                <p className="mb-6 text-xs text-white/50">
                  Reference: {error.digest}
                </p>
              )}
              <button
                type="button"
                onClick={reset}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
