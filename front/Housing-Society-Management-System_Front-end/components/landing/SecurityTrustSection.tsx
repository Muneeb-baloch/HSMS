"use client";

import { Lock, Server, Clock, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const trustItems = [
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "256-bit SSL encryption with SOC 2 compliant infrastructure",
  },
  {
    icon: Server,
    title: "PLRA Integrated",
    description:
      "Direct integration with Punjab Land Records Authority systems",
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "Enterprise-grade reliability with multi-region redundancy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team available round the clock via chat, phone, and email",
  },
];

const partners = [
  "DHA Lahore",
  "Bahria Town",
  "Capital Smart City",
  "Park View City",
  "Blue World City",
  "Faisal Hills",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function SecurityTrustSection() {
  return (
    <section
      id="trust"
      className="scroll-mt-20 relative overflow-hidden bg-[#0F172A] py-20 lg:py-28"
      aria-label="Trust and security"
    >
      {/* Subtle gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold tracking-widest text-emerald-400 uppercase">
            Trust & Security
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by Leading Societies
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            Built with enterprise-grade security and trusted by the most
            prestigious housing societies across Pakistan.
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {trustItems.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15">
                <item.icon className="size-5 text-emerald-400" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Partner Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 border-t border-white/10 pt-12"
        >
          <p className="mb-8 text-center text-sm font-medium tracking-wider text-slate-500 uppercase">
            Partnered with Pakistan&apos;s Finest
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {partners.map((partner) => (
              <div
                key={partner}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-400 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
              >
                {partner}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
