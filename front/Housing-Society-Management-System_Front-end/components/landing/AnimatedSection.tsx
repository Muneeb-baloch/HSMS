"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Stagger delay in seconds for children */
  delay?: number;
  /** Override threshold for intersection (0–1) */
  threshold?: number;
}

export function AnimatedSection({
  children,
  className = "",
  id,
  delay = 0,
  threshold = 0.08,
}: AnimatedSectionProps) {
  return (
    <motion.section
      id={id}
      className={[id ? "scroll-mt-20" : "", className].filter(Boolean).join(" ")}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.section>
  );
}
