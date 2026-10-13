"use client";

import type { TablerIcon } from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: TablerIcon;
  href?: string;
  iconBgClassName?: string;
  iconClassName?: string;
  delay?: number;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  href,
  iconBgClassName = "bg-teal-100 text-teal-600",
  iconClassName = "text-teal-600",
  delay = 0,
}: KpiCardProps) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-gray-900">
          {value}
        </p>
      </div>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300",
          iconBgClassName
        )}
      >
        <Icon className={cn("size-5", iconClassName)} aria-hidden />
      </div>
    </div>
  );

  const cardClass = cn(
    "rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm",
    "transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
  );

  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { href } : { role: "article" as const };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Wrapper className={cn("block h-full", cardClass)} {...wrapperProps}>
        {content}
      </Wrapper>
    </motion.div>
  );
}
