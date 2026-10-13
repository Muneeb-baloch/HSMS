"use client";

import {
  LayoutGrid,
  Wallet,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: LayoutGrid,
    title: "Smart Plot Management",
    description:
      "Track every plot from allotment to registry. Automated transfers, ownership history, and real-time status tracking across all phases.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Wallet,
    title: "Transparent Finances",
    description:
      "Real-time billing, installment tracking, and digital receipts. Automated reminders, late-fee calculations, and full audit trails.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    description:
      "Predictive analytics for payment defaults, smart notifications for dues, and data-driven reports for society committees.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: ShieldCheck,
    title: "Complete Security",
    description:
      "Visitor management with QR codes, CCTV integration dashboard, emergency SOS alerts, and resident verification systems.",
    color: "bg-amber-50 text-amber-600",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function CrisisSolversSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-slate-50 py-20 lg:py-28"
      aria-label="Features"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold tracking-widest text-emerald-600 uppercase">
            Why Choose Us
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why Choose SocietySphere
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Everything your housing society needs to operate efficiently,
            transparently, and securely — all in one platform.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
              >
                <feature.icon className="size-6" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
              >
                Learn more
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
