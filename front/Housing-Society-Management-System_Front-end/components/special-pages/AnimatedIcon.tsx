"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "pulse" | "bounce" | "shake" | "float";

interface AnimatedIconProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variants = {
  pulse: {
    initial: { scale: 1, opacity: 0.9 },
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.9, 1, 0.9],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  },
  bounce: {
    initial: { y: 0 },
    animate: {
      y: [0, -12, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  },
  shake: {
    initial: { x: 0 },
    animate: {
      x: [0, -8, 8, -6, 6, 0],
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  float: {
    initial: { y: 0 },
    animate: {
      y: [0, -6, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  },
};

export function AnimatedIcon({
  children,
  variant = "pulse",
  className,
}: AnimatedIconProps) {
  const config = variants[variant];
  return (
    <motion.span
      initial={config.initial}
      animate={config.animate}
      className={cn("inline-flex", className)}
      aria-hidden
    >
      {children}
    </motion.span>
  );
}
