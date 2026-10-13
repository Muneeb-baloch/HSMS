// src/lib/constants/srDevStatus.constants.ts
import { DevCategory, DevPhase } from "@/lib/types/srdevstatus";

export const DEV_CATEGORY_LABELS: Record<DevCategory, string> = {
  [DevCategory.INFRASTRUCTURE]: "Infrastructure",
  [DevCategory.CONSTRUCTION]: "Construction",
  [DevCategory.LEGAL]: "Legal",
  [DevCategory.PLANNING]: "Planning",
  [DevCategory.SERVICES]: "Services",
  [DevCategory.COMPLETION]: "Completion",
};

export const DEV_CATEGORY_COLORS: Record<DevCategory, string> = {
  [DevCategory.INFRASTRUCTURE]: "#4CAF50", // Green
  [DevCategory.CONSTRUCTION]: "#FF9800", // Orange
  [DevCategory.LEGAL]: "#2196F3", // Blue
  [DevCategory.PLANNING]: "#9C27B0", // Purple
  [DevCategory.SERVICES]: "#00BCD4", // Cyan
  [DevCategory.COMPLETION]: "#8BC34A", // Light Green
};

export const DEV_PHASE_LABELS: Record<DevPhase, string> = {
  [DevPhase.PRE_CONSTRUCTION]: "Pre-Construction",
  [DevPhase.CONSTRUCTION]: "Construction",
  [DevPhase.POST_CONSTRUCTION]: "Post-Construction",
  [DevPhase.COMPLETION]: "Completion",
};

export const DEV_PHASE_COLORS: Record<DevPhase, string> = {
  [DevPhase.PRE_CONSTRUCTION]: "#2196F3", // Blue
  [DevPhase.CONSTRUCTION]: "#FF9800", // Orange
  [DevPhase.POST_CONSTRUCTION]: "#4CAF50", // Green
  [DevPhase.COMPLETION]: "#9C27B0", // Purple
};

export const DEV_PHASE_ICONS: Record<DevPhase, string> = {
  [DevPhase.PRE_CONSTRUCTION]: "Blueprint",
  [DevPhase.CONSTRUCTION]: "Building",
  [DevPhase.POST_CONSTRUCTION]: "CheckCircle",
  [DevPhase.COMPLETION]: "Award",
};

export const DEV_CATEGORY_ICONS: Record<DevCategory, string> = {
  [DevCategory.INFRASTRUCTURE]: "Wrench",
  [DevCategory.CONSTRUCTION]: "Hammer",
  [DevCategory.LEGAL]: "Scale",
  [DevCategory.PLANNING]: "Map",
  [DevCategory.SERVICES]: "Users",
  [DevCategory.COMPLETION]: "CheckCircle",
};

export const DEFAULT_COLORS = [
  { name: "Red", value: "#FF0000" },
  { name: "Green", value: "#00FF00" },
  { name: "Blue", value: "#0000FF" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Orange", value: "#FFA500" },
  { name: "Purple", value: "#800080" },
  { name: "Teal", value: "#008080" },
  { name: "Gray", value: "#808080" },
  { name: "Brown", value: "#A52A2A" },
  { name: "Pink", value: "#FFC0CB" },
  { name: "Indigo", value: "#4B0082" },
  { name: "Cyan", value: "#00FFFF" },
];

export const DEV_CATEGORY_OPTIONS = Object.values(DevCategory).map(
  (category) => ({
    value: category,
    label: DEV_CATEGORY_LABELS[category],
    color: DEV_CATEGORY_COLORS[category],
  }),
);

export const DEV_PHASE_OPTIONS = Object.values(DevPhase).map((phase) => ({
  value: phase,
  label: DEV_PHASE_LABELS[phase],
  color: DEV_PHASE_COLORS[phase],
}));

export const PERCENTAGE_OPTIONS = Array.from({ length: 21 }, (_, i) => ({
  value: i * 5,
  label: `${i * 5}%`,
}));

export const DURATION_OPTIONS = [
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "1 month" },
  { value: 60, label: "2 months" },
  { value: 90, label: "3 months" },
  { value: 180, label: "6 months" },
  { value: 365, label: "1 year" },
];

export const SEQUENCE_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: `Position ${i + 1}`,
}));

// Phase percentage validation ranges
export const PHASE_PERCENTAGE_RANGES: Record<
  DevPhase,
  { min: number; max: number }
> = {
  [DevPhase.PRE_CONSTRUCTION]: { min: 0, max: 30 },
  [DevPhase.CONSTRUCTION]: { min: 31, max: 80 },
  [DevPhase.POST_CONSTRUCTION]: { min: 81, max: 99 },
  [DevPhase.COMPLETION]: { min: 100, max: 100 },
};
