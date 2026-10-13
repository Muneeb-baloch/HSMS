"use client";

import type { ReactNode } from "react";
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import Link from "next/link";

interface SpecialPageLayoutProps {
  children: ReactNode;
}

export function SpecialPageLayout({ children }: SpecialPageLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/15 via-transparent to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link
          href="/"
          className="absolute left-4 top-4 flex items-center gap-2 text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
            <IconBuildingSkyscraper className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold">HSMS</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
