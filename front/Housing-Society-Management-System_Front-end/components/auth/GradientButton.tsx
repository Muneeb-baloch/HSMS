"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}

export function GradientButton({
  children,
  isLoading = false,
  loadingText = "Please wait...",
  className,
  disabled,
  ...props
}: GradientButtonProps) {
  return (
    <motion.button
      type={props.type ?? "submit"}
      whileHover={!disabled && !isLoading ? { scale: 1.01 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      disabled={disabled || isLoading}
      className={cn(
        "relative w-full h-10 rounded-lg bg-emerald-600 px-4 py-2.5",
        "text-sm font-semibold text-white",
        "transition-all duration-200",
        "hover:bg-emerald-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-emerald-600",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span
            className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden
          />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
