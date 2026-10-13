"use client";

import {
  IconLayoutDashboard,
  IconReceipt,
  IconUsers,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  PRODUCT_PREVIEW_VISUALS,
  type ProductPreviewVisualId,
} from "@/lib/constants/landing-visuals";
import { cn } from "@/lib/utils";
import {
  FramedLandingImage,
  LandingSegmentedTabs,
} from "./LandingVisualToggle";

const PREVIEWS: {
  id: ProductPreviewVisualId;
  title: string;
  description: string;
  icon: typeof IconLayoutDashboard;
  iconGradient: string;
}[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Real-time KPIs, payment trends, plot status, and AI insights.",
    icon: IconLayoutDashboard,
    iconGradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "finance",
    title: "Financial Overview",
    description: "Bills, installments, defaulters, and payment tracking.",
    icon: IconReceipt,
    iconGradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "members",
    title: "Member Management",
    description: "Members, plots, possessions, nominees, and transfers.",
    icon: IconUsers,
    iconGradient: "from-violet-500 to-purple-500",
  },
];

const PREVIEW_TOGGLE_OPTIONS = PREVIEWS.map((p) => ({
  id: p.id,
  label: p.title,
}));

export function ProductPreviewSection() {
  const [activeId, setActiveId] = useState<ProductPreviewVisualId>("dashboard");
  const visual = PRODUCT_PREVIEW_VISUALS[activeId];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/15 via-transparent to-transparent" />
      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Product Preview
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            See HSMS in Action
          </h2>
          <p className="mx-auto max-w-xl text-sm text-white/70">
            Toggle previews to explore how dashboards, finance, and member
            workflows come together — then sign in for the live product.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PREVIEWS.map((p, i) => {
            const selected = activeId === p.id;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6 }}
              >
                <button
                  type="button"
                  onClick={() => setActiveId(p.id)}
                  className={cn(
                    "w-full rounded-xl border p-6 text-left backdrop-blur-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
                    selected
                      ? "border-teal-500/50 bg-teal-950/30 shadow-lg shadow-teal-900/20"
                      : "border-white/20 bg-white/5 hover:bg-white/10 hover:shadow-xl"
                  )}
                  aria-pressed={selected}
                >
                  <div
                    className={`mb-4 flex size-11 items-center justify-center rounded-lg bg-gradient-to-br ${p.iconGradient}`}
                  >
                    <p.icon
                      className="size-6 text-white"
                      stroke={1.5}
                      aria-hidden
                    />
                  </div>
                  <h3 className="mb-1.5 text-base font-bold text-white">
                    {p.title}
                  </h3>
                  <p className="text-sm text-white/70">{p.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-teal-400">
                    {selected ? "Showing preview ↓" : "Show preview →"}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-2xl border border-white/20 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-md"
        >
          <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-white/90">
                Live preview
              </span>
            </div>
            <LandingSegmentedTabs
              options={PREVIEW_TOGGLE_OPTIONS}
              value={activeId}
              onChange={setActiveId}
              ariaLabel="Product area preview"
              className="sm:ml-auto"
            />
          </div>

          <div className="relative p-4 sm:p-6">
            <div className="relative min-h-[220px] sm:min-h-[280px] md:min-h-[360px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0"
                >
                  <FramedLandingImage
                    src={visual.src}
                    alt={visual.alt}
                    sizes="(max-width: 768px) 100vw, 1152px"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="relative z-10 mt-4 max-w-3xl text-sm leading-relaxed text-white/75">
              {visual.caption}
            </p>
            <div className="relative z-10 mt-6 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-teal-900/30 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                Open platform
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-lg border border-white/25 bg-white/5 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Members", "Plots", "Defaulters", "Revenue"].map((label) => (
              <div
                key={label}
                className="rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="h-3 w-20 rounded bg-white/20" />
                <div className="mt-1.5 h-6 w-14 rounded bg-white/30" />
                <div className="mt-0.5 text-[10px] text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
