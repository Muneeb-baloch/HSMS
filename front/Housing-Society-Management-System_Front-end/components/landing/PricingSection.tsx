"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for small societies getting started with digital management.",
    features: [
      "Up to 100 plots",
      "Basic billing & receipts",
      "Visitor log management",
      "Community announcements",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "PKR 5,000",
    period: "/month",
    description: "For growing societies that need advanced tools and integrations.",
    features: [
      "Unlimited plots",
      "Advanced financial reports",
      "Installment tracking",
      "AI-powered insights",
      "CCTV integration",
      "Priority support",
      "Custom branding",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "PKR 15,000",
    period: "/month",
    description: "For large societies and developers with complex requirements.",
    features: [
      "Everything in Professional",
      "Multi-society management",
      "PLRA integration",
      "Custom API access",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise option",
      "White-label solution",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 bg-white py-20 lg:py-28"
      aria-label="Pricing"
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
            Pricing
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Choose the plan that fits your society. No hidden fees, cancel
            anytime.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-16 grid gap-8 lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={`relative rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                plan.popular
                  ? "border-emerald-200 bg-emerald-50/50 shadow-lg shadow-emerald-100/50 ring-1 ring-emerald-600/20"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="font-serif text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-slate-500">{plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-600">{plan.description}</p>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={plan.name === "Enterprise" ? "/contact" : "/register-society"}
                  className={`flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                    plan.popular
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 hover:shadow-emerald-500/30"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
