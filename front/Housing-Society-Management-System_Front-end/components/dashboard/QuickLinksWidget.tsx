"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconArrowsExchange,
  IconBuildingSkyscraper,
  IconMapPin,
  IconReceipt,
  IconSpeakerphone,
  IconUsers,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { GlassCard } from "./GlassCard";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

interface QuickLinksWidgetProps {
  userRole: UserRole;
}

const LINK_COLORS = [
  "text-blue-500 dark:text-blue-400",
  "text-emerald-500 dark:text-emerald-400",
  "text-violet-500 dark:text-violet-400",
  "text-amber-500 dark:text-amber-400",
  "text-rose-500 dark:text-rose-400",
  "text-cyan-500 dark:text-cyan-400",
  "text-indigo-500 dark:text-indigo-400",
  "text-orange-500 dark:text-orange-400",
];
const LINKS = [
  { id: "members", title: "Members", href: "/members", icon: IconUsers, role: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { id: "projects", title: "Projects", href: "/projects", icon: IconBuildingSkyscraper, role: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { id: "plots", title: "Plots", href: "/plots", icon: IconMapPin, role: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { id: "installments", title: "Installments", href: "/installments", icon: IconReceipt, role: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { id: "transfers", title: "Transfers", href: "/transfers", icon: IconArrowsExchange, role: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { id: "billinfo", title: "Bills", href: "/billinfo", icon: IconReceipt, role: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { id: "defaulter", title: "Defaulters", href: "/defaulter", icon: IconAlertTriangle, role: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { id: "complaints", title: "Complaints", href: "/complaints", icon: IconAlertTriangle, role: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  { id: "announcements", title: "Announcements", href: "/announcements", icon: IconSpeakerphone, role: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
];

export function QuickLinksWidget({ userRole }: QuickLinksWidgetProps) {
  const visibleLinks = LINKS.filter((l) => hasPermission(userRole, l.role));

  return (
    <GlassCard variant="glass-soft" delay={260}>
      <div className="p-5 md:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Quick Actions</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">Navigate to main modules</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visibleLinks.map((link, idx) => {
            const Icon = link.icon;
            const iconColor = LINK_COLORS[idx % LINK_COLORS.length];
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + idx * 0.04 }}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5",
                    "transition-all duration-300 hover:scale-[1.03] hover:bg-white/20 hover:border-white/20 hover:shadow-md",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                  )}
                  aria-label={`Go to ${link.title}`}
                >
                  <span className={cn("flex", iconColor)}>
                    <Icon className="size-5 shrink-0" aria-hidden />
                  </span>
                  <span className="truncate text-sm font-medium">{link.title}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
