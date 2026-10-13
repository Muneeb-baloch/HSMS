"use client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";

interface ExportButtonProps {
  label?: string;
  exportFn: () => Promise<any>;
  fileName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
}

export function ExportButton({ label = "Export CSV", exportFn, fileName, variant = "outline", size = "sm" }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await exportFn();
      const csvData = response?.data?.data?.data || response?.data?.data || "";
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      customToast.success("Export completed");
    } catch {
      customToast.error("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileDown className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
}
