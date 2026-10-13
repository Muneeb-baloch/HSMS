"use client";

import {
  IconChartBar,
  IconClock,
  IconShield,
  IconTrendingDown,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  BENEFITS_VISUALS,
  type BenefitsVisualId,
} from "@/lib/constants/landing-visuals";
import {
  FramedLandingImage,
  LandingSegmentedTabs,
} from "./LandingVisualToggle";

const BENEFITS = [
  {
    icon: IconChartBar,
    value: "1000+",
    label: "Plots managed effortlessly",
    iconGradient: "from-teal-500 to-emerald-600",
  },
  {
    icon: IconTrendingDown,
    value: "30%",
    label: "Reduction in defaulters",
    iconGradient: "from-amber-500 to-orange-500",
  },
  {
    icon: IconClock,
    value: "Hours saved",
    label: "Weekly on manual tracking",
    iconGradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: IconShield,
    value: "99.9%",
    label: "Uptime & security",
    iconGradient: "from-emerald-500 to-teal-600",
  },
];

const BENEFIT_VISUAL_TABS: { id: BenefitsVisualId; label: string }[] = [
  { id: "scale", label: BENEFITS_VISUALS.scale.label },
  { id: "trust", label: BENEFITS_VISUALS.trust.label },
];

export function BenefitsSection() {
  const [visual, setVisual] = useState<BenefitsVisualId>("scale");
  const v = BENEFITS_VISUALS[visual];

  return (
    <section
      id="benefits"
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent" />
      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center lg:mb-14">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Why HSMS
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            Built for Scale & Trust
          </h2>
          <p className="mx-auto max-w-xl text-sm text-white/70">
            Automated installments and defaulter alerts save hours weekly.
            Real-time dashboards and role-based access keep operations secure.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="mb-4 flex justify-center lg:justify-start">
              <LandingSegmentedTabs
                options={BENEFIT_VISUAL_TABS}
                value={visual}
                onChange={setVisual}
                ariaLabel="Benefits story focus"
              />
            </div>
            <p className="mb-4 text-center text-sm text-white/60 lg:text-left">
              {v.blurb}
            </p>
            <div className="relative mx-auto max-w-md min-h-[240px] sm:min-h-[300px] lg:mx-0 lg:max-w-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={visual}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <FramedLandingImage
                    src={v.src}
                    alt={v.alt}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className="rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur-md"
              >
                <div
                  className={`mb-3 flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${b.iconGradient}`}
                >
                  <b.icon className="size-5 text-white" stroke={1.5} aria-hidden />
                </div>
                <div className="text-2xl font-bold text-white md:text-3xl">
                  {b.value}
                </div>
                <div className="mt-0.5 text-sm text-white/70">{b.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
