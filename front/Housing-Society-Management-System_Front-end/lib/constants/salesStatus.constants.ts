// src/lib/constants/salesStatus.constants.ts
import { SalesStatusType } from "@/lib/types/salesStatus";

export const STATUS_TYPE_LABELS: Record<SalesStatusType, string> = {
  [SalesStatusType.AVAILABLE]: "Available",
  [SalesStatusType.BOOKED]: "Booked",
  [SalesStatusType.RESERVED]: "Reserved",
  [SalesStatusType.ALLOTTED]: "Allotted",
  [SalesStatusType.CONTRACTED]: "Contracted",
  [SalesStatusType.CANCELLED]: "Cancelled",
  [SalesStatusType.ON_HOLD]: "On Hold",
  [SalesStatusType.SOLD]: "Sold",
  [SalesStatusType.PENDING]: "Pending",
  [SalesStatusType.CLOSED]: "Closed",
};

export const STATUS_TYPE_COLORS: Record<SalesStatusType, string> = {
  [SalesStatusType.AVAILABLE]: "#10B981", // Green
  [SalesStatusType.BOOKED]: "#3B82F6", // Blue
  [SalesStatusType.RESERVED]: "#F59E0B", // Orange
  [SalesStatusType.ALLOTTED]: "#8B5CF6", // Purple
  [SalesStatusType.CONTRACTED]: "#6366F1", // Indigo
  [SalesStatusType.CANCELLED]: "#EF4444", // Red
  [SalesStatusType.ON_HOLD]: "#FBBF24", // Yellow
  [SalesStatusType.SOLD]: "#059669", // Emerald
  [SalesStatusType.PENDING]: "#6B7280", // Gray
  [SalesStatusType.CLOSED]: "#1F2937", // Gray Dark
};

export const STATUS_TYPE_BADGE_VARIANTS: Record<SalesStatusType, string> = {
  [SalesStatusType.AVAILABLE]: "success",
  [SalesStatusType.BOOKED]: "info",
  [SalesStatusType.RESERVED]: "warning",
  [SalesStatusType.ALLOTTED]: "secondary",
  [SalesStatusType.CONTRACTED]: "primary",
  [SalesStatusType.CANCELLED]: "destructive",
  [SalesStatusType.ON_HOLD]: "outline",
  [SalesStatusType.SOLD]: "success",
  [SalesStatusType.PENDING]: "secondary",
  [SalesStatusType.CLOSED]: "default",
};

export const STATUS_TYPE_ICONS: Record<SalesStatusType, string> = {
  [SalesStatusType.AVAILABLE]: "CheckCircle",
  [SalesStatusType.BOOKED]: "Bookmark",
  [SalesStatusType.RESERVED]: "Shield",
  [SalesStatusType.ALLOTTED]: "FileCheck",
  [SalesStatusType.CONTRACTED]: "FileSignature",
  [SalesStatusType.CANCELLED]: "XCircle",
  [SalesStatusType.ON_HOLD]: "PauseCircle",
  [SalesStatusType.SOLD]: "DollarSign",
  [SalesStatusType.PENDING]: "Clock",
  [SalesStatusType.CLOSED]: "Lock",
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

export const STATUS_TYPE_OPTIONS = Object.values(SalesStatusType).map(
  (type) => ({
    value: type,
    label: STATUS_TYPE_LABELS[type],
    color: STATUS_TYPE_COLORS[type],
  }),
);

export const SEQUENCE_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: (i + 1).toString(), // <-- convert to string
  label: `Position ${i + 1}`,
}));
