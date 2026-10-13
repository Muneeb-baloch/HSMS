"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function StickyDemoBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/10 bg-[#1E293B]/95 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-white">
              Start managing your society today
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500"
              >
                Free Trial
              </Link>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
