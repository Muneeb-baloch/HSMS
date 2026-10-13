"use client";

import { Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "SocietySphere transformed how we manage DHA Phase 6. Plot transfers that took weeks now happen in hours. The financial transparency has eliminated all disputes.",
    name: "Brigadier (R) Mahmood Ahmed",
    role: "President, DHA Phase 6 Lahore",
    society: "DHA Lahore",
    initials: "MA",
  },
  {
    quote:
      "Managing 12,000+ plots in Bahria Town was a nightmare with spreadsheets. SocietySphere gave us real-time visibility into every transaction. Our collection rate improved by 35%.",
    name: "Ahmed Raza Khan",
    role: "General Manager Operations",
    society: "Bahria Town Islamabad",
    initials: "AK",
  },
  {
    quote:
      "The visitor management and security features are outstanding. Our residents feel safer, and the society committee has full audit trails for every decision made.",
    name: "Fatima Zahra Sheikh",
    role: "Secretary, Residents Committee",
    society: "Capital Smart City",
    initials: "FS",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-20 bg-slate-50 py-20 lg:py-28"
      aria-label="Testimonials"
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
            Testimonials
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Hear from society administrators and committee members who
            transformed their operations with SocietySphere.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="relative rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Quote className="size-8 text-emerald-100" strokeWidth={2} />
              <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <p className="text-xs font-medium text-emerald-600">
                    {t.society}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
