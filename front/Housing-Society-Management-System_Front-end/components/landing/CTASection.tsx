"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function LandingCTASection() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-20 overflow-hidden bg-[#0F172A] py-20 lg:py-28"
      aria-label="Call to action"
    >
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(16,185,129,0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      <div className="pointer-events-none absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Transform
            <br />
            Your Society?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
            Join hundreds of societies already using SocietySphere to streamline
            operations, improve transparency, and build stronger communities.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register-society"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:bg-emerald-500 hover:shadow-emerald-500/30"
            >
              Register Your Society
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
            >
              Schedule Demo
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            No credit card required. Free for societies with up to 100 plots.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
