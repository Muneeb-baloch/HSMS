"use client";

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface CustomToastProps {
  message: string;
  type: ToastType;
  title?: string;
  onDismiss?: () => void;
}

const typeConfig: Record<
  ToastType,
  {
    borderColor: string;
    iconColor: string;
    icon: React.ReactNode;
    titleGradient: string;
    title: string;
  }
> = {
  success: {
    borderColor: "border-l-4 border-l-emerald-500",
    iconColor: "text-emerald-400",
    icon: <IconCircleCheck className="size-5 shrink-0" stroke={2} />,
    titleGradient: "from-emerald-400 to-green-400",
    title: "Success",
  },
  error: {
    borderColor: "border-l-4 border-l-rose-500",
    iconColor: "text-rose-400",
    icon: <IconX className="size-5 shrink-0" stroke={2} />,
    titleGradient: "from-rose-400 to-red-400",
    title: "Error",
  },
  warning: {
    borderColor: "border-l-4 border-l-amber-500",
    iconColor: "text-amber-400",
    icon: <IconAlertTriangle className="size-5 shrink-0" stroke={2} />,
    titleGradient: "from-amber-400 to-yellow-400",
    title: "Warning",
  },
  info: {
    borderColor: "border-l-4 border-l-indigo-500",
    iconColor: "text-indigo-400",
    icon: <IconInfoCircle className="size-5 shrink-0" stroke={2} />,
    titleGradient: "from-indigo-400 to-blue-400",
    title: "Info",
  },
  loading: {
    borderColor: "border-l-4 border-l-gray-500",
    iconColor: "text-gray-400",
    icon: (
      <IconLoader2 className="size-5 shrink-0 animate-spin" stroke={2} />
    ),
    titleGradient: "from-gray-400 to-slate-400",
    title: "Loading",
  },
};

export function CustomToast({
  message,
  type,
  title,
  onDismiss,
}: CustomToastProps) {
  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -4 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className={`
        flex max-w-[400px] items-start gap-3 rounded-xl border border-white/10
        bg-gray-900/40 p-4 shadow-lg shadow-black/50 backdrop-blur-xl
        ${config.borderColor}
        max-sm:w-[calc(100vw-2rem)]
      `}
    >
      <div className={config.iconColor} aria-hidden>
        {config.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`bg-gradient-to-r ${config.titleGradient} bg-clip-text text-sm font-semibold text-transparent`}
        >
          {title ?? config.title}
        </p>
        <p className="mt-0.5 text-sm text-gray-200">{message}</p>
      </div>

      {onDismiss && type !== "loading" && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Dismiss"
        >
          <IconX className="size-4" stroke={2} />
        </button>
      )}
    </motion.div>
  );
}
