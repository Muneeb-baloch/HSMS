/**
 * Curated landing imagery — housing society context, finance, and operations.
 * Used with next/image; hostname must be allowed in next.config.ts.
 */
export type HeroVisualId = "community" | "operations" | "residents";

export const HERO_VISUALS: Record<
  HeroVisualId,
  { src: string; label: string; headline: string; alt: string }
> = {
  community: {
    src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=85",
    label: "Communities",
    headline: "Modern societies you can represent in HSMS",
    alt: "Residential housing development with green landscaping",
  },
  operations: {
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
    label: "Operations",
    headline: "Where admins plan finance, plots, and compliance",
    alt: "Professional office workspace with laptop and documents",
  },
  residents: {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85",
    label: "Residents",
    headline: "Transparent engagement for every household",
    alt: "Diverse team collaborating around a table",
  },
};

export type ProductPreviewVisualId = "dashboard" | "finance" | "members";

export const PRODUCT_PREVIEW_VISUALS: Record<
  ProductPreviewVisualId,
  { src: string; alt: string; caption: string }
> = {
  dashboard: {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=85",
    alt: "Analytics dashboard on a screen showing charts and KPIs",
    caption: "Live KPIs, plot mix, and collections — tuned for society boards.",
  },
  finance: {
    src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1800&q=85",
    alt: "Desk with calculator, ledger, and financial planning materials",
    caption: "Installments, defaulters, and receipts in one controlled workflow.",
  },
  members: {
    src: "https://images.unsplash.com/photo-1600880292203-75761962b79b?auto=format&fit=crop&w=1800&q=85",
    alt: "Professionals reviewing documents together in a meeting",
    caption: "Members, plots, transfers, and registry — aligned with your bylaws.",
  },
};

export type BenefitsVisualId = "scale" | "trust";

export const BENEFITS_VISUALS: Record<
  BenefitsVisualId,
  { src: string; alt: string; label: string; blurb: string }
> = {
  scale: {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
    alt: "City skyline at dusk symbolizing scale and multi-site operations",
    label: "Multi-site scale",
    blurb: "Coordinate many towers and phases without losing a single ledger line.",
  },
  trust: {
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80",
    alt: "Professionals reviewing compliance documents together",
    label: "Governance & trust",
    blurb: "Audit-friendly workflows, permissions, and history residents can rely on.",
  },
};
