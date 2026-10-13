"use client";

import { Building2, MonitorSmartphone, Users } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Building2,
    step: "01",
    title: "Register Your Society",
    description:
      "Sign up in minutes. Add your society details, phases, blocks, and plot maps. Our onboarding team helps you get set up — free of charge.",
  },
  {
    icon: MonitorSmartphone,
    step: "02",
    title: "Manage Everything Digitally",
    description:
      "From plot transfers to maintenance billing, visitor logs to meeting minutes — handle all society operations from one unified dashboard.",
  },
  {
    icon: Users,
    step: "03",
    title: "Grow Your Community",
    description:
      "Engage residents with announcements, polls, and events. Build a transparent, connected community that thrives together.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function FeaturesComparisonSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-white py-20 lg:py-28"
      aria-label="How it works"
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
            Simple Process
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Get your society up and running in three simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative mt-20"
        >
          {/* Connecting Line (desktop) */}
          <div className="absolute top-16 right-[16.67%] left-[16.67%] hidden h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 lg:block" />

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={stepVariants}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step Number Circle */}
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-emerald-100 bg-emerald-50">
                    <step.icon
                      className="size-12 text-emerald-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/30">
                    {step.step}
                  </div>
                </div>

                {/* Connector Dot (desktop) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-16 -right-4 hidden h-3 w-3 rounded-full bg-emerald-500 lg:block" />
                )}

                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
