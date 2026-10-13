"use client";

import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AuthInput } from "./AuthInput";

export interface PasswordInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "type"> {
  error?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <AuthInput
          ref={ref}
          type={visible ? "text" : "password"}
          error={error}
          className={cn("pr-10", className)}
          aria-describedby="password-toggle-description"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <IconEyeOff className="size-4" aria-hidden />
          ) : (
            <IconEye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
