"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
  /** Soft neumorphism-style shadow (inset + subtle raise) */
  variant?: "glass" | "glass-soft" | "glass-strong";
  /** Enable hover scale animation */
  hoverScale?: boolean;
  /** Delay for stagger animation (ms) */
  delay?: number;
}

export function GlassCard({
  children,
  className,
  variant = "glass",
  hoverScale = true,
  delay = 0,
  ...rest
}: GlassCardProps) {
  const variants = {
    glass: "bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20",
    "glass-soft":
      "bg-white/40 dark:bg-white/[0.07] backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl shadow-black/[0.06] dark:shadow-black/30",
    "glass-strong":
      "bg-white/50 dark:bg-white/10 backdrop-blur-2xl border border-white/40 dark:border-white/15 shadow-2xl shadow-black/10 dark:shadow-black/40",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hoverScale ? { scale: 1.02 } : undefined}
      className={cn(
        "rounded-2xl overflow-hidden transition-shadow duration-300",
        "hover:shadow-xl dark:hover:shadow-2xl hover:border-white/30 dark:hover:border-white/20",
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
