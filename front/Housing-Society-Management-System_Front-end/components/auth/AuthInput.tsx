"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AuthInputProps extends React.ComponentPropsWithoutRef<"input"> {
  error?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
          "transition-all duration-200",
          "focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          "hover:border-slate-400",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
    );
  }
);

AuthInput.displayName = "AuthInput";
