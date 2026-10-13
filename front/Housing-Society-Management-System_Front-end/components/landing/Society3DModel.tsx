"use client";

import { motion } from "framer-motion";
import {
  IconHome2,
  IconBuildingMosque,
  IconTrees,
  IconBuildingStore,
} from "@tabler/icons-react";

export function Society3DModel() {
  const items = [
    {
      icon: IconHome2,
      label: "Residential",
      color: "from-teal-500/30 to-emerald-600/20",
      borderColor: "border-teal-500/30",
    },
    {
      icon: IconBuildingMosque,
      label: "Mosque",
      color: "from-amber-500/30 to-orange-500/20",
      borderColor: "border-amber-500/30",
    },
    {
      icon: IconTrees,
      label: "Park",
      color: "from-green-500/30 to-emerald-600/20",
      borderColor: "border-green-500/30",
    },
    {
      icon: IconBuildingStore,
      label: "Market",
      color: "from-indigo-500/30 to-violet-500/20",
      borderColor: "border-indigo-500/30",
    },
  ];

  return (
    <section
      className="relative h-[400px] w-full overflow-hidden md:h-[500px] lg:h-[550px]"
      aria-label="Interactive society overview - residential plots, mosque, park, and market"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-indigo-900/10" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-sm font-medium uppercase tracking-wider text-white/60"
        >
          Your Society at a Glance
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.08, y: -6 }}
                className={`flex flex-col items-center gap-3 rounded-2xl border ${item.borderColor} bg-gradient-to-br ${item.color} p-6 backdrop-blur-md md:p-8`}
              >
                <div
                  className={`rounded-xl bg-gradient-to-br ${item.color} p-4`}
                  style={{
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                >
                  <Icon
                    className="size-10 text-white md:size-12"
                    stroke={1.5}
                    aria-hidden
                  />
                </div>
                <span className="text-sm font-semibold text-white">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-xs text-white/50"
        >
          Houses · Mosque · Park · Market · Gates
        </motion.p>
      </div>
    </section>
  );
}
