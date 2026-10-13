"use client";

import { Search, MapPin, Home, DollarSign } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface HeroProps {
  visitorType?: "admin" | "member" | "general";
}

const stats = [
  { value: "500+", label: "Societies" },
  { value: "50,000+", label: "Plots" },
  { value: "10,000+", label: "Members" },
  { value: "98%", label: "Satisfaction" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.15,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function Hero({ visitorType = "general" }: HeroProps) {
  const copy =
    visitorType === "admin"
      ? {
          headline: "Manage Your Society with Complete Control",
          sub: "Role-based approvals, maintenance billing, and audit-ready financial reporting in one powerful platform.",
        }
      : visitorType === "member"
        ? {
            headline: "Your Society, Your Dashboard",
            sub: "View charges, submit tickets, track payments, and stay connected with your community effortlessly.",
          }
        : {
            headline: "Find Your Dream Plot in Pakistan's Premier Societies",
            sub: "From DHA to Bahria Town \u2014 manage plots, payments, and community all in one platform.",
          };

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden"
      aria-label="Introduction"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-32 pb-32 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Pakistan&apos;s #1 Society Management Platform
          </motion.p>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {copy.headline}
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300"
          >
            {copy.sub}
          </motion.p>

          {/* Search Bar */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 rounded-2xl border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur-xl sm:p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Location */}
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <MapPin className="size-5 shrink-0 text-emerald-400" />
                <select className="w-full bg-transparent text-sm text-white outline-none [&>option]:text-slate-900">
                  <option value="">Select Location</option>
                  <option>DHA Lahore</option>
                  <option>Bahria Town Islamabad</option>
                  <option>DHA Karachi</option>
                  <option>Bahria Town Lahore</option>
                  <option>Capital Smart City</option>
                  <option>Blue World City</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <Home className="size-5 shrink-0 text-emerald-400" />
                <select className="w-full bg-transparent text-sm text-white outline-none [&>option]:text-slate-900">
                  <option value="">Property Type</option>
                  <option>Residential Plot</option>
                  <option>Commercial Plot</option>
                  <option>Farmhouse</option>
                  <option>Apartment</option>
                </select>
              </div>

              {/* Budget */}
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <DollarSign className="size-5 shrink-0 text-emerald-400" />
                <select className="w-full bg-transparent text-sm text-white outline-none [&>option]:text-slate-900">
                  <option value="">Budget Range</option>
                  <option>Under 50 Lac</option>
                  <option>50 Lac - 1 Crore</option>
                  <option>1 - 3 Crore</option>
                  <option>3 - 5 Crore</option>
                  <option>5 Crore+</option>
                </select>
              </div>

              {/* Search Button */}
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40"
              >
                <Search className="size-4" />
                <span>Search</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 border-t border-white/10"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-4 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
