"use client";

import { type ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface AnimatedChartWrapperProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
  delay?: number;
}

export function AnimatedChartWrapper({
  children,
  title,
  description,
  className,
  delay = 0,
}: AnimatedChartWrapperProps) {
  return (
    <GlassCard
      variant="glass-soft"
      hoverScale={false}
      delay={delay}
      className={cn("h-full", className)}
    >
      <div className="p-5 md:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className="min-h-[240px] w-full">{children}</div>
      </div>
    </GlassCard>
  );
}
