"use client";

import type { TablerIcon } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: TablerIcon;
  title: string;
  description: string;
  delay?: number;
  className?: string;
  /** Gradient for icon bg, e.g. "from-teal-500 to-emerald-500" */
  iconGradient?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
  className,
  iconGradient = "from-teal-500 to-emerald-500",
}: FeatureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      className={cn(
        "rounded-xl border border-white/20 bg-white/5 backdrop-blur-md",
        "shadow-lg shadow-black/20",
        "p-5 transition-shadow duration-300",
        "hover:bg-white/10 hover:shadow-xl hover:shadow-black/30",
        className
      )}
    >
      <div
        className={cn(
          "mb-3 flex size-10 items-center justify-center rounded-lg bg-gradient-to-br",
          iconGradient,
          "shadow-lg transition-transform duration-300 hover:scale-110"
        )}
      >
        <Icon className="size-5 text-white" stroke={1.5} aria-hidden />
      </div>
      <h3 className="mb-1.5 text-base font-bold text-white">{title}</h3>
      <p className="text-xs leading-relaxed text-white/80">{description}</p>
    </motion.article>
  );
}
