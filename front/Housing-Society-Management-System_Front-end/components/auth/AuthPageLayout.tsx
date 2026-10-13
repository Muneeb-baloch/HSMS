"use client";

import type { ReactNode } from "react";
import Link from "next/link";

interface AuthPageLayoutProps {
  children: ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-slate-50" />
      <div className="absolute top-0 right-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/3 -translate-x-1/3 rounded-full bg-slate-100/60 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600">
            <svg
              className="size-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SocietySphere
          </span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center gap-6 text-center">
          <Link
            href="/terms"
            className="text-xs text-slate-400 transition hover:text-emerald-600"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-slate-400 transition hover:text-emerald-600"
          >
            Privacy
          </Link>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} SocietySphere
          </p>
        </div>
      </div>
    </div>
  );
}
