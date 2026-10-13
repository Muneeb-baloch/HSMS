"use client";

import { useAuthStatus } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuthStatus();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const actuallyAuthenticated = isAuthenticated || !!token;

      if (!actuallyAuthenticated && !isLoading) {
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  if (isChecking || isLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center bg-gray-50"
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard"
      >
        <div className="text-center">
          <div
            className="mx-auto mb-3 size-10 animate-spin rounded-full border-2 border-gray-200 border-t-purple-600"
            aria-hidden
          />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!isAuthenticated && !token) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center bg-gray-50"
        role="alert"
      >
        <div className="text-center">
          <h1 className="mb-3 text-xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="text-sm text-gray-600">
            Please login to access the dashboard
          </p>
          <button
            onClick={() => router.push("/login")}
            className={cn(
              "mt-4 rounded-full bg-purple-600 px-5 py-2 text-sm font-medium text-white",
              "transition-colors hover:bg-purple-500",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            )}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    user?.firstName || user?.email?.split("@")[0] || "there";

  return (
    <main
      className="min-h-full bg-gray-50 font-sans"
      role="main"
      aria-label="Housing Society Dashboard"
    >
      <div className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-8">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Housing Society Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-gray-600">
              Welcome back, {displayName}
            </p>
          </div>
          <motion.a
            href="/projects/create"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white",
              "transition-colors hover:bg-purple-500",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            )}
          >
            <span className="size-4 text-lg leading-none">+</span>
            New Project
          </motion.a>
        </motion.section>

        <DashboardGrid />
      </div>
    </main>
  );
}
