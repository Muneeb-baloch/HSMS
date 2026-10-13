"use client";

import {
  IconReceipt,
  IconUsers,
  IconMapPin,
  IconArrowsExchange,
  IconAlertTriangle,
  IconFileDescription,
  IconSpeakerphone,
  IconShield,
} from "@tabler/icons-react";
import { AnimatedSection } from "./AnimatedSection";
import { FeatureCard } from "./FeatureCard";

const FEATURES = [
  {
    icon: IconUsers,
    title: "Member Management",
    description:
      "Centralized member database, nominee tracking, and role-based access. Manage thousands of residents with ease.",
    iconGradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: IconMapPin,
    title: "Plot & Possession",
    description:
      "Track plot inventory, sales status, possession handovers, and development status across projects.",
    iconGradient: "from-teal-500 to-emerald-600",
  },
  {
    icon: IconReceipt,
    title: "Financial Tracking",
    description:
      "Installments, bills, payment modes, and automated defaulter alerts. Reduce manual reconciliation by 70%.",
    iconGradient: "from-amber-500 to-orange-500",
  },
  {
    icon: IconArrowsExchange,
    title: "Transfers & Registry",
    description:
      "Handle plot transfers, fee calculations, and registry workflows with full audit trails.",
    iconGradient: "from-rose-500 to-pink-500",
  },
  {
    icon: IconAlertTriangle,
    title: "Complaints Handling",
    description:
      "Categorize, prioritize, and resolve complaints with real-time status updates for residents.",
    iconGradient: "from-amber-500 to-yellow-500",
  },
  {
    icon: IconFileDescription,
    title: "Applications",
    description:
      "Manage society applications, approvals, and document workflows in one place.",
    iconGradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: IconSpeakerphone,
    title: "Announcements",
    description:
      "Broadcast announcements to members with categorization and instant notifications.",
    iconGradient: "from-violet-500 to-purple-500",
  },
  {
    icon: IconShield,
    title: "Security & Permissions",
    description:
      "Granular roles (Admin, Moderator, User), permissions, and secure multi-tenancy.",
    iconGradient: "from-emerald-500 to-teal-600",
  },
];

export function FeaturesSection() {
  return (
    <AnimatedSection id="features" className="py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            Core Modules
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            Everything You Need to Run a Society
          </h2>
          <p className="mx-auto max-w-xl text-sm text-white/70">
            From member onboarding to defaulter management—powerful tools
            tailored for housing society admins and stakeholders.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              description={f.description}
              delay={i * 60}
              iconGradient={f.iconGradient}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
