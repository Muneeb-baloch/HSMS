"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthGlassCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthGlassCard({ children, className }: AuthGlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}
