/**
 * Dashboard metrics and layout types for HSMS
 */

export interface DashboardMetrics {
  members: number;
  projects: number;
  plots: number;
  plotsAvailable: number;
  plotsSold: number;
  possessions: number;
  nominees: number;
  transfers: number;
  installmentsDue: number;
  installmentsOverdue: number;
  defaulters: number;
  billsPending: number;
  billsOverdue: number;
  complaintsOpen: number;
  announcements: number;
  filesTotal: number;
}

export interface DashboardGridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export type DashboardWidgetId =
  | "metrics-row"
  | "payment-trend"
  | "plot-status-pie"
  | "plot-sales-bar"
  | "financial-area"
  | "defaulters-scatter"
  | "quick-links"
  | "notifications"
  | "ai-insights";

export const DEFAULT_LAYOUT: DashboardGridItem[] = [
  { i: "metrics-row", x: 0, y: 0, w: 12, h: 2, minW: 6 },
  { i: "payment-trend", x: 0, y: 2, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "plot-status-pie", x: 6, y: 2, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "plot-sales-bar", x: 0, y: 5, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "financial-area", x: 6, y: 5, w: 6, h: 3, minW: 4, minH: 2 },
  { i: "quick-links", x: 0, y: 8, w: 4, h: 2, minW: 2, minH: 1 },
  { i: "notifications", x: 4, y: 8, w: 4, h: 2, minW: 2, minH: 1 },
  { i: "ai-insights", x: 8, y: 8, w: 4, h: 2, minW: 2, minH: 1 },
  { i: "defaulters-scatter", x: 0, y: 10, w: 12, h: 3, minW: 6, minH: 2 },
];

export const LAYOUT_STORAGE_KEY = "hsms-dashboard-layout";
