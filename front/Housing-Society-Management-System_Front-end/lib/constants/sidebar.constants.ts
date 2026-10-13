// src/lib/constants/sidebar.constants.ts
import {
  IconAlertOctagon,
  IconAlertTriangle,
  IconArrowsExchange,
  IconBuilding,
  IconBuildingSkyscraper,
  IconBuildingStore,
  IconCalendarEvent,
  IconCash,
  IconCategory,
  IconCertificate,
  IconChartBar,
  IconClock,
  IconClockCheck,
  IconClipboardList,
  IconCreditCard,
  IconCrown,
  IconDatabase,
  IconDoor,
  IconFileDescription,
  IconFileText,
  IconFileWord,
  IconFolder,
  IconForms,
  IconGitBranch,
  IconHelp,
  IconKey,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLock,
  IconMap2,
  IconMapPin,
  IconMessage,
  IconMessages,
  IconPackage,
  IconParking,
  IconReceipt,
  IconReport,
  IconRobot,
  IconRuler,
  IconSearch,
  IconSettings,
  IconShield,
  IconShoppingCart,
  IconSpeakerphone,
  IconTag,
  IconTool,
  IconTools,
  IconTrophy,
  IconUserCircle,
  IconUsers,
  type Icon as TablerIcon,
} from "@tabler/icons-react";

import { hasPermission, UserRole } from "./roles";

export interface SidebarNavItem {
  id: string;
  title: string;
  url: string;
  icon: TablerIcon;
  requiredRole?: UserRole | UserRole[];
  children?: SidebarNavItem[];
  isDivider?: boolean;
  sectionTitle?: string;
  badge?: string;
}

export interface SidebarConfig {
  sections: {
    id: string;
    title?: string;
    items: SidebarNavItem[];
  }[];
  user: {
    name: string;
    email: string;
    avatar: string;
    role: UserRole;
  };
}

// ─── 1. Dashboard ─────────────────────────────────────────────────────────────
const DASHBOARD_ITEMS: SidebarNavItem[] = [
  {
    id: "dashboard",
    title: "Overview",
    url: "/dashboard",
    icon: IconLayoutDashboard,
    requiredRole: [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
  },
];

// ─── 2. Member & Property Management ──────────────────────────────────────────
const MEMBER_PROPERTY_ITEMS: SidebarNavItem[] = [
  {
    id: "member-property-section",
    sectionTitle: "Member & Property Management",
    title: "",
    url: "",
    icon: IconUsers,
    isDivider: true,
  },
  {
    id: "members",
    title: "Members",
    url: "/members",
    icon: IconUsers,
    requiredRole: [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
  },
  {
    id: "projects",
    title: "Projects",
    url: "/projects",
    icon: IconBuildingSkyscraper,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "projects-view", title: "View All", url: "/projects", icon: IconFileText, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "projects-add", title: "Add Project", url: "/projects/create", icon: IconFileWord, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "projects-import", title: "Import Projects", url: "/projects/import", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "plots",
    title: "Plots",
    url: "/plots",
    icon: IconMapPin,
    requiredRole: [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
  },
  {
    id: "possession",
    title: "Possession",
    url: "/possessions",
    icon: IconKey,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "possession-view", title: "View All", url: "/possessions", icon: IconFileText, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "possession-add", title: "Add Possession", url: "/possessions/create", icon: IconFileText, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "possession-import", title: "Import Possessions", url: "/possessions/import", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "nominees",
    title: "Nominees",
    url: "/nominees",
    icon: IconUserCircle,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "transfers",
    title: "Transfers",
    url: "/transfers",
    icon: IconArrowsExchange,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "transferTypes",
    title: "Transfer Types",
    url: "/transfer-types",
    icon: IconCategory,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
];

// ─── 3. Financial Management ──────────────────────────────────────────────────
const FINANCIAL_ITEMS: SidebarNavItem[] = [
  {
    id: "financial-section",
    sectionTitle: "Financial Management",
    title: "",
    url: "",
    icon: IconCash,
    isDivider: true,
  },
  {
    id: "installments",
    title: "Installments",
    url: "/installments",
    icon: IconReceipt,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "installments-view", title: "View All", url: "/installments", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "installments-add", title: "Add Installment", url: "/installments/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "installment-plans",
    title: "Installment Plans",
    url: "/installment-plans",
    icon: IconClock,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "installment-plans-view", title: "View All", url: "/installment-plans", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "installment-plans-add", title: "Add Plan", url: "/installment-plans/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "installment-plan-details",
    title: "Installment Plan Details",
    url: "/installment-plan-details",
    icon: IconClipboardList,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "installment-plan-details-view", title: "View All", url: "/installment-plan-details", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "installment-plan-details-add", title: "Add Detail", url: "/installment-plan-details/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "installmentcategories",
    title: "Installment Categories",
    url: "/installment-categories",
    icon: IconCategory,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "installmentcategories-view", title: "View All", url: "/installment-categories", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "installmentcategories-add", title: "Add Category", url: "/installment-categories/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "billinfo",
    title: "Bills",
    url: "/billinfo",
    icon: IconReceipt,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "billtype",
    title: "Bill Types",
    url: "/billtype",
    icon: IconFileText,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "paymentmodes",
    title: "Payment Modes",
    url: "/paymentmodes",
    icon: IconCreditCard,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "paymentmodes-view", title: "View All", url: "/paymentmodes", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "paymentmodes-add", title: "Add Payment Mode", url: "/paymentmodes/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "payment-gateway",
    title: "Payment Gateway",
    url: "/payment-gateway",
    icon: IconCreditCard,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "defaulter",
    title: "Defaulters",
    url: "/defaulter",
    icon: IconAlertTriangle,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "gamification",
    title: "Gamification",
    url: "/gamification",
    icon: IconTrophy,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "gamification-leaderboard", title: "Leaderboard", url: "/gamification/leaderboard", icon: IconTrophy, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "gamification-rewards", title: "Rewards", url: "/gamification/rewards", icon: IconTrophy, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "gamification-redemptions", title: "Redemptions", url: "/gamification/redemptions", icon: IconTrophy, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
];

// ─── 4. Applications & Requests ───────────────────────────────────────────────
const APPLICATIONS_ITEMS: SidebarNavItem[] = [
  {
    id: "applications-section",
    sectionTitle: "Applications & Requests",
    title: "",
    url: "",
    icon: IconFileDescription,
    isDivider: true,
  },
  {
    id: "applications",
    title: "Applications",
    url: "/applications",
    icon: IconFileDescription,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "registry",
    title: "Registry",
    url: "/registry",
    icon: IconClipboardList,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "complaints",
    title: "Complaints",
    url: "/complaints",
    icon: IconAlertTriangle,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "complaincatg",
    title: "Complaint Categories",
    url: "/complain-categories",
    icon: IconCategory,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "complaincatg-view", title: "View All", url: "/complaintcatg", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "complaincatg-add", title: "Add Category", url: "/complain-categories/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
];

// ─── 5. Master Data / System Records ──────────────────────────────────────────
const MASTER_DATA_ITEMS: SidebarNavItem[] = [
  {
    id: "master-data-section",
    sectionTitle: "Master Data",
    title: "",
    url: "",
    icon: IconDatabase,
    isDivider: true,
  },
  {
    id: "plotcategories",
    title: "Plot Categories",
    url: "/plotcategories",
    icon: IconCategory,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "plotcategories-view", title: "View All", url: "/plotcategories", icon: IconFileText, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "plotcategories-add", title: "Add Category", url: "/plotcategories/create", icon: IconFileText, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "plotcategories-import", title: "Import Categories", url: "/plotcategories/import", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "plotblocks",
    title: "Plot Blocks",
    url: "/plotblocks",
    icon: IconLayoutGrid,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "plotblocks-view", title: "View All", url: "/plotblocks", icon: IconRuler, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "plotblocks-add", title: "Add Block", url: "/plotblocks/create", icon: IconDatabase, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "plotblocks-import", title: "Import Blocks", url: "/plotblocks/import", icon: IconDatabase, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "plotsizes",
    title: "Plot Sizes",
    url: "/plotsizes",
    icon: IconRuler,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "plotsizes-view", title: "View All", url: "/plotsizes", icon: IconDatabase, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "plotsizes-add", title: "Add Size", url: "/plotsizes/create", icon: IconDatabase, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "plotsizes-import", title: "Import Sizes", url: "/plotsizes/import", icon: IconDatabase, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "plottypes",
    title: "Plot Types",
    url: "/plottypes",
    icon: IconTag,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "plottypes-view", title: "View All", url: "/plottypes", icon: IconDatabase, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "plottypes-add", title: "Add Type", url: "/plottypes/create", icon: IconDatabase, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "plottypes-import", title: "Import Types", url: "/plottypes/import", icon: IconDatabase, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "cities",
    title: "Cities",
    url: "/cities",
    icon: IconMapPin,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "cities-view", title: "View All", url: "/cities", icon: IconDatabase, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "cities-add", title: "Add City", url: "/cities/create", icon: IconDatabase, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "cities-import", title: "Import Cities", url: "/cities/import", icon: IconDatabase, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "states",
    title: "States",
    url: "/states",
    icon: IconMap2,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "states-view", title: "View All", url: "/states", icon: IconReport, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "states-add", title: "Add State", url: "/states/create", icon: IconReport, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "statuses",
    title: "Statuses",
    url: "/status",
    icon: IconReport,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "statuses-view", title: "View All", url: "/status", icon: IconReport, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "statuses-add", title: "Add Status", url: "/status/create", icon: IconReport, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "sr-dev-status",
    title: "Development Status",
    url: "/sr-dev-status",
    icon: IconTools,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "sr-dev-status-view", title: "View All", url: "/sr-dev-status", icon: IconFileText, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "sr-dev-status-add", title: "Add Status", url: "/sr-dev-status/create", icon: IconFileText, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "sr-dev-status-import", title: "Import Statuses", url: "/sr-dev-status/import", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "sales-status",
    title: "Sales Status",
    url: "/sales-status",
    icon: IconCash,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "sales-status-view", title: "View All", url: "/sales-status", icon: IconFileText, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "sales-status-add", title: "Add Status", url: "/sales-status/create", icon: IconFileText, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "sales-status-import", title: "Import Statuses", url: "/sales-status/import", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "application-types",
    title: "Application Types",
    url: "/application-types",
    icon: IconFileDescription,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "application-types-view", title: "View All", url: "/application-types", icon: IconFileText, requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "application-types-add", title: "Add Type", url: "/application-types/create", icon: IconFileText, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "application-types-import", title: "Import Types", url: "/application-types/import", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
];

// ─── 6. Administration & Access Control ───────────────────────────────────────
const ADMINISTRATION_ITEMS: SidebarNavItem[] = [
  {
    id: "administration-section",
    sectionTitle: "Administration",
    title: "",
    url: "",
    icon: IconShield,
    isDivider: true,
  },
  {
    id: "userstaff",
    title: "Users & Staff",
    url: "/userstaff",
    icon: IconUsers,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "userstaff-view", title: "View All", url: "/userstaff", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "userstaffadd", title: "Add User", url: "/userstaff/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "roles",
    title: "Roles",
    url: "/roles",
    icon: IconShield,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "roles-view", title: "View All", url: "/roles", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "roles-add", title: "Add Role", url: "/roles/create", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "permissions",
    title: "Permissions",
    url: "/permissions",
    icon: IconLock,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "permissions-view", title: "View All", url: "/permissions", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "permissions-add", title: "Add Permission", url: "/permissions/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "privacy",
    title: "Privacy Settings",
    url: "/privacy-settings",
    icon: IconShield,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "plra",
    title: "PLRA Compliance",
    url: "/plra",
    icon: IconCertificate,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "plra-certificates", title: "Certificates", url: "/plra/certificates", icon: IconCertificate, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "plra-compliance", title: "Compliance", url: "/plra/compliance", icon: IconCertificate, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "meetings",
    title: "Meetings",
    url: "/meetings",
    icon: IconCalendarEvent,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "polls",
    title: "Polls",
    url: "/polls",
    icon: IconChartBar,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
];

// ─── 7. Communication & Content ───────────────────────────────────────────────
const COMMUNICATION_ITEMS: SidebarNavItem[] = [
  {
    id: "communication-section",
    sectionTitle: "Communication & Content",
    title: "",
    url: "",
    icon: IconSpeakerphone,
    isDivider: true,
  },
  {
    id: "announcements",
    title: "Announcements",
    url: "/announcements",
    icon: IconSpeakerphone,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "announcementcategories",
    title: "Announcement Categories",
    url: "/announcementcategory",
    icon: IconCategory,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "announcementcategories-view", title: "View All", url: "/announcementcategory", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "announcementcategories-add", title: "Add Category", url: "/announcementcategory/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "sms-logs",
    title: "SMS Logs",
    url: "/sms",
    icon: IconMessage,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "forum",
    title: "Forum",
    url: "/forum",
    icon: IconMessages,
    requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "files",
    title: "Files",
    url: "/file",
    icon: IconFolder,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
];

// ─── 8. AI & Automation ─────────────────────────────────────────────────────
const AI_AUTOMATION_ITEMS: SidebarNavItem[] = [
  {
    id: "ai-automation-section",
    sectionTitle: "AI & Automation",
    title: "",
    url: "",
    icon: IconRobot,
    isDivider: true,
  },
  {
    id: "workflows",
    title: "Workflows",
    url: "/workflows",
    icon: IconGitBranch,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "custom-forms",
    title: "Custom Forms",
    url: "/custom-forms",
    icon: IconForms,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    url: "/ai",
    icon: IconRobot,
    requiredRole: [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
      UserRole.MODERATOR,
      UserRole.USER,
    ],
  },
];

// ─── 9. Vendor Management ───────────────────────────────────────────────────
const VENDOR_ITEMS: SidebarNavItem[] = [
  {
    id: "vendor-section",
    sectionTitle: "Vendor Management",
    title: "",
    url: "",
    icon: IconBuildingStore,
    isDivider: true,
  },
  {
    id: "vendors",
    title: "Vendors",
    url: "/vendors",
    icon: IconBuildingStore,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "vendors-all", title: "All Vendors", url: "/vendors", icon: IconBuildingStore, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "work-orders", title: "Work Orders", url: "/work-orders", icon: IconClipboardList, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "vendor-contracts", title: "Contracts", url: "/vendor-contracts", icon: IconFileDescription, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "vendor-invoices", title: "Invoices", url: "/vendor-invoices", icon: IconReceipt, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
];

// ─── 10. Workforce ──────────────────────────────────────────────────────────
const WORKFORCE_ITEMS: SidebarNavItem[] = [
  {
    id: "workforce-section",
    sectionTitle: "Workforce",
    title: "",
    url: "",
    icon: IconClockCheck,
    isDivider: true,
  },
  {
    id: "attendance",
    title: "Attendance",
    url: "/attendance",
    icon: IconClockCheck,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "geofences",
    title: "Geofences",
    url: "/geofences",
    icon: IconMapPin,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
];

// ─── 11. Visitor & Facility Management ────────────────────────────────────────
const VISITOR_FACILITY_ITEMS: SidebarNavItem[] = [
  {
    id: "visitor-facility-section",
    sectionTitle: "Visitor & Facility",
    title: "",
    url: "",
    icon: IconDoor,
    isDivider: true,
  },
  {
    id: "visitors",
    title: "Visitor Management",
    url: "/visitors",
    icon: IconDoor,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "visitors-list", title: "All Visitors", url: "/visitors", icon: IconFileText, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "visitors-create", title: "New Visitor Pass", url: "/visitors/create", icon: IconFileWord, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "facilities",
    title: "Facilities",
    url: "/facilities",
    icon: IconBuilding,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "facilities-list", title: "All Facilities", url: "/facilities", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "facilities-create", title: "Add Facility", url: "/facilities/create", icon: IconFileWord, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "facility-bookings",
    title: "Facility Bookings",
    url: "/facility-bookings",
    icon: IconCalendarEvent,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "bookings-list", title: "All Bookings", url: "/facility-bookings", icon: IconFileText, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "bookings-create", title: "New Booking", url: "/facility-bookings/create", icon: IconFileWord, requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "parking",
    title: "Parking",
    url: "/parking",
    icon: IconParking,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "gate-passes",
    title: "Gate Pass",
    url: "/gate-passes",
    icon: IconDoor,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "maintenance-requests",
    title: "Maintenance Requests",
    url: "/maintenance-requests",
    icon: IconTool,
    requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
];

// ─── 12. Community ──────────────────────────────────────────────────────────
const COMMUNITY_ITEMS: SidebarNavItem[] = [
  {
    id: "community-section",
    sectionTitle: "Community",
    title: "",
    url: "",
    icon: IconUsers,
    isDivider: true,
  },
  {
    id: "marketplace",
    title: "Marketplace",
    url: "/marketplace",
    icon: IconShoppingCart,
    requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "emergency",
    title: "Emergency",
    url: "/emergency",
    icon: IconAlertOctagon,
    requiredRole: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
];

// ─── 13. Staff ──────────────────────────────────────────────────────────────
const STAFF_ITEMS: SidebarNavItem[] = [
  {
    id: "staff-section",
    sectionTitle: "Staff",
    title: "",
    url: "",
    icon: IconUsers,
    isDivider: true,
  },
  {
    id: "staff-registry",
    title: "Staff Registry",
    url: "/staff-registry",
    icon: IconUsers,
    requiredRole: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
];

// ─── 9. Super Admin & SaaS ──────────────────────────────────────────────────
const SUPER_ADMIN_ITEMS: SidebarNavItem[] = [
  {
    id: "super-admin-section",
    sectionTitle: "Super Admin",
    title: "",
    url: "",
    icon: IconCrown,
    isDivider: true,
  },
  {
    id: "super-admin",
    title: "Platform Dashboard",
    url: "/super-admin",
    icon: IconCrown,
    requiredRole: [UserRole.SUPER_ADMIN],
    children: [
      { id: "super-admin-overview", title: "Overview", url: "/super-admin", icon: IconLayoutDashboard, requiredRole: [UserRole.SUPER_ADMIN] },
      { id: "super-admin-societies", title: "Manage Societies", url: "/super-admin/societies", icon: IconBuilding, requiredRole: [UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "societies",
    title: "Societies",
    url: "/societies",
    icon: IconBuilding,
    requiredRole: [UserRole.SUPER_ADMIN],
    children: [
      { id: "societies-list", title: "All Societies", url: "/societies", icon: IconFileText, requiredRole: [UserRole.SUPER_ADMIN] },
      { id: "societies-create", title: "Create Society", url: "/societies/create", icon: IconFileWord, requiredRole: [UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "pdf-generator",
    title: "PDF Generator",
    url: "/pdf",
    icon: IconFileText,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "subscription",
    title: "Subscription",
    url: "/subscription",
    icon: IconPackage,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: "lookups",
    title: "Lookup Tables",
    url: "/lookups",
    icon: IconDatabase,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
];

// ─── 10. System Configuration ──────────────────────────────────────────────────
const SYSTEM_CONFIG_ITEMS: SidebarNavItem[] = [
  {
    id: "system-config-section",
    sectionTitle: "System Configuration",
    title: "",
    url: "",
    icon: IconSettings,
    isDivider: true,
  },
  {
    id: "settings",
    title: "Settings",
    url: "/settings",
    icon: IconSettings,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    children: [
      { id: "general-settings", title: "General Settings", url: "/settings/general", icon: IconSettings, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "user-management", title: "User Management", url: "/settings/users", icon: IconUsers, requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      { id: "role-management", title: "Role Management", url: "/settings/roles", icon: IconShield, requiredRole: [UserRole.SUPER_ADMIN] },
    ],
  },
  {
    id: "word-assistant",
    title: "Word Assistant",
    url: "/word-assistant",
    icon: IconRobot,
    requiredRole: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
];

// ─── Legacy Exports (backward compatibility) ──────────────────────────────────
export const MAIN_NAV_ITEMS: SidebarNavItem[] = DASHBOARD_ITEMS;

export const MANAGEMENT_ITEMS: SidebarNavItem[] = [
  ...MEMBER_PROPERTY_ITEMS,
  ...FINANCIAL_ITEMS,
  ...APPLICATIONS_ITEMS,
  ...MASTER_DATA_ITEMS,
  ...ADMINISTRATION_ITEMS,
  ...COMMUNICATION_ITEMS,
  ...AI_AUTOMATION_ITEMS,
  ...VENDOR_ITEMS,
  ...WORKFORCE_ITEMS,
  ...VISITOR_FACILITY_ITEMS,
  ...COMMUNITY_ITEMS,
  ...STAFF_ITEMS,
  ...SUPER_ADMIN_ITEMS,
];

export const CONFIGURATION_ITEMS: SidebarNavItem[] = SYSTEM_CONFIG_ITEMS;

export const SECONDARY_NAV_ITEMS: SidebarNavItem[] = [
  {
    id: "settings",
    title: "Settings",
    url: "/settings",
    icon: IconSettings,
    requiredRole: [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
  },
  {
    id: "help",
    title: "Get Help",
    url: "/help",
    icon: IconHelp,
    requiredRole: [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
  },
  {
    id: "search",
    title: "Search",
    url: "/search",
    icon: IconSearch,
    requiredRole: [
      UserRole.USER,
      UserRole.MODERATOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ],
  },
];

// ─── Helper & Config ──────────────────────────────────────────────────────────
export const filterItemsByRole = (
  items: SidebarNavItem[],
  userRole: UserRole,
): SidebarNavItem[] => {
  return items
    .filter((item) => {
      if (!item.requiredRole) return true;
      if (item.isDivider || item.sectionTitle) return true;
      return hasPermission(userRole, item.requiredRole);
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: filterItemsByRole(item.children, userRole),
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.children && item.children.length === 0) return false;
      return true;
    });
};

export const getSidebarConfig = (userRole: UserRole): SidebarConfig => {
  return {
    sections: [
      { id: "dashboard", title: "Dashboard", items: filterItemsByRole(DASHBOARD_ITEMS, userRole) },
      { id: "member-property", title: "Member & Property", items: filterItemsByRole(MEMBER_PROPERTY_ITEMS, userRole) },
      { id: "financial", title: "Financial", items: filterItemsByRole(FINANCIAL_ITEMS, userRole) },
      { id: "applications", title: "Applications & Requests", items: filterItemsByRole(APPLICATIONS_ITEMS, userRole) },
      { id: "master-data", title: "Master Data", items: filterItemsByRole(MASTER_DATA_ITEMS, userRole) },
      { id: "administration", title: "Administration", items: filterItemsByRole(ADMINISTRATION_ITEMS, userRole) },
      { id: "communication", title: "Communication", items: filterItemsByRole(COMMUNICATION_ITEMS, userRole) },
      { id: "ai-automation", title: "AI & Automation", items: filterItemsByRole(AI_AUTOMATION_ITEMS, userRole) },
      { id: "vendors", title: "Vendor Management", items: filterItemsByRole(VENDOR_ITEMS, userRole) },
      { id: "workforce", title: "Workforce", items: filterItemsByRole(WORKFORCE_ITEMS, userRole) },
      { id: "visitor-facility", title: "Visitor & Facility", items: filterItemsByRole(VISITOR_FACILITY_ITEMS, userRole) },
      { id: "community", title: "Community", items: filterItemsByRole(COMMUNITY_ITEMS, userRole) },
      { id: "staff", title: "Staff", items: filterItemsByRole(STAFF_ITEMS, userRole) },
      { id: "super-admin", title: "Super Admin", items: filterItemsByRole(SUPER_ADMIN_ITEMS, userRole) },
      { id: "system-config", title: "System", items: filterItemsByRole(SYSTEM_CONFIG_ITEMS, userRole) },
    ],
    user: {
      name: "Loading...",
      email: "Loading...",
      avatar: "",
      role: userRole,
    },
  };
};
