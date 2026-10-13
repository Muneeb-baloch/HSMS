"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { type ReactNode, useId } from "react";

type ToggleOption<T extends string> = {
  id: T;
  label: string;
};

interface LandingSegmentedTabsProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  /** Accessible name for the tablist */
  ariaLabel?: string;
}

export function LandingSegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel = "Choose preview",
}: LandingSegmentedTabsProps<T>) {
  const baseId = useId();

  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-xl border border-white/15 bg-black/30 p-1 backdrop-blur-md",
        className
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`${baseId}-${opt.id}`}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 sm:px-4 sm:text-sm",
              selected
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/40"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface LandingVisualToggleProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (id: T) => void;
  children: ReactNode;
  hint?: string;
  className?: string;
}

export function LandingVisualToggle<T extends string>({
  options,
  value,
  onChange,
  children,
  hint,
  className,
}: LandingVisualToggleProps<T>) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <LandingSegmentedTabs
        options={options}
        value={value}
        onChange={onChange}
        ariaLabel="Hero imagery focus"
      />
      {hint ? (
        <p className="text-xs text-white/50 sm:text-sm">{hint}</p>
      ) : null}
      <div className="relative min-h-[200px] flex-1 sm:min-h-[260px] lg:min-h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface FramedLandingImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}

export function FramedLandingImage({
  src,
  alt,
  priority,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: FramedLandingImageProps) {
  return (
    <div className="relative h-full min-h-[200px] overflow-hidden rounded-2xl border border-white/15 bg-gray-950 shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:min-h-[260px] lg:min-h-[320px]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent" />
    </div>
  );
}
