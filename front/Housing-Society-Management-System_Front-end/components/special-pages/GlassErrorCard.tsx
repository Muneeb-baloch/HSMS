"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassErrorCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassErrorCard({ children, className }: GlassErrorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "w-full max-w-md rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl",
        "shadow-2xl shadow-blue-900/20",
        "p-8 sm:p-10",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
