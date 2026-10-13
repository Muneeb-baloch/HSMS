"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const footerLinks = {
  Company: [
    { label: "About", href: "#trust" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  Support: [
    { label: "Help Center", href: "/contact" },
    { label: "Contact Us", href: "#contact" },
    { label: "Community", href: "/forum" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socials = [
  { label: "Facebook", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
];

export function LandingFooter() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="bg-[#0F172A] pt-16 pb-8" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand + Newsletter */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
                <span className="text-sm font-bold text-white">SS</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                SocietySphere
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Pakistan&apos;s premier housing society management platform.
              Streamline operations, build transparency, grow communities.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-white">
                Stay updated
              </p>
              {subscribed ? (
                <p className="mt-3 text-sm text-emerald-400">
                  Thanks! We&apos;ll keep you updated.
                </p>
              ) : (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubscribed(true);
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-semibold text-white">{title}</h4>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("#") ? (
                        <a
                          href={link.href}
                          className="text-sm text-slate-400 transition-colors hover:text-emerald-400"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-slate-400 transition-colors hover:text-emerald-400"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SocietySphere. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener"
                className="text-sm text-slate-500 transition-colors hover:text-emerald-400"
                aria-label={social.label}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
