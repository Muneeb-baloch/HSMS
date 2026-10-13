"use client";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";

interface DownloadButtonProps {
  label?: string;
  generateFn: () => Promise<any>;
  fileName: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function DownloadButton({ label = "Download", generateFn, fileName, variant = "outline", size = "sm", className }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await generateFn();
      const html = response?.data?.data?.html || response?.data?.html || response?.data;

      // Open HTML in new tab for printing/saving as PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
      }
      customToast.success(`${label} generated successfully`);
    } catch (error) {
      customToast.error(`Failed to generate ${label.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleDownload} disabled={loading} className={className}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
}
