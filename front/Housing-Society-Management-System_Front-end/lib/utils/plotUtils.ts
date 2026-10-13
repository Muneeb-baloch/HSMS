// src/lib/utils/plotUtils.ts
import { Plot } from "@/lib/types/plot";

export const calculatePlotNetPrice = (plot: Plot): number => {
  return plot.plotBasePrice + plot.surchargeAmount - plot.discountAmount;
};

export const calculatePricePerUnit = (plot: Plot): number => {
  if (plot.plotArea <= 0) return 0;
  return parseFloat((plot.plotBasePrice / plot.plotArea).toFixed(2));
};

export const formatPlotDimensions = (plot: Plot): string => {
  return `${plot.plotLength}ft × ${plot.plotWidth}ft`;
};

export const getPlotStatus = (plot: Plot): string => {
  if (plot.isDeleted) return "Deleted";
  if (!plot.fileId) return "Available";
  if (plot.isPossessionReady) return "Possession Ready";
  return "Sold";
};

export const generatePlotSummary = (plots: Plot[]) => {
  return {
    totalPlots: plots.length,
    availablePlots: plots.filter((p) => !p.fileId).length,
    soldPlots: plots.filter((p) => p.fileId).length,
    totalArea: plots.reduce((sum, p) => sum + p.plotArea, 0),
    totalValue: plots.reduce((sum, p) => sum + p.plotTotalAmount, 0),
    averagePrice:
      plots.length > 0
        ? Math.round(
            plots.reduce((sum, p) => sum + p.plotTotalAmount, 0) / plots.length,
          )
        : 0,
  };
};

export const validatePlotAssignment = (
  plot: Plot,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (plot.fileId) {
    errors.push("Plot is already assigned to a customer");
  }

  if (plot.isDeleted) {
    errors.push("Plot has been deleted");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
// src/lib/utils/string.ts
export const capitalizeFirstLetter = (
  str: string | undefined | null,
): string => {
  if (!str) return "";
  try {
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch (error) {
    return str;
  }
};

export const formatPlotType = (plotType: string | undefined | null): string => {
  if (!plotType) return "N/A";
  try {
    return plotType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch (error) {
    return plotType;
  }
};
