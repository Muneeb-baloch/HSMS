"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#trust", label: "About" },
  { href: "#contact", label: "Contact" },
] as const;

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 shadow-lg shadow-black/5 backdrop-blur-xl"
          : "bg-white/5 backdrop-blur-sm"
      }`}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
            <span className="text-sm font-bold text-white">SS</span>
          </div>
          <span
            className={`text-lg font-bold tracking-tight transition-colors duration-500 ${
              scrolled ? "text-slate-900" : "text-white"
            }`}
          >
            SocietySphere
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                scrolled
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
              scrolled
                ? "text-slate-700 hover:text-slate-900"
                : "text-white/90 hover:text-white"
            }`}
          >
            Login
          </Link>
          <Link
            href="/register-society"
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 border ${
              scrolled
                ? "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                : "border-white/30 text-white/90 hover:bg-white/10"
            }`}
          >
            Register Society
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:bg-emerald-500 hover:shadow-emerald-500/30"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className={`flex size-10 items-center justify-center rounded-full transition-colors md:hidden ${
            scrolled
              ? "text-slate-700 hover:bg-slate-100"
              : "text-white hover:bg-white/10"
          }`}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="size-5" strokeWidth={1.75} />
          ) : (
            <Menu className="size-5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <nav
              className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4"
              aria-label="Mobile navigation"
            >
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register-society"
                  className="rounded-lg border border-emerald-600 px-4 py-3 text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Register Society
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
