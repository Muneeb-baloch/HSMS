"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGenerateReceipt,
  useGenerateInvoice,
  useGenerateCertificate,
  useGenerateNOC,
  useGenerateAllotmentLetter,
} from "@/lib/hooks/entities/usePDFGenerator";
import { useAuth } from "@/lib/hooks/useAuth";
import { customToast } from "@/lib/utils/customToast";
import {
  FileText,
  Receipt,
  FileCheck,
  ScrollText,
  Home,
  Loader2,
} from "lucide-react";
import { useState } from "react";

type TemplateType = "receipt" | "invoice" | "certificate" | "noc" | "allotment-letter";

interface TemplateConfig {
  key: TemplateType;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: { name: string; label: string; type: string; required?: boolean; placeholder?: string }[];
}

const templates: TemplateConfig[] = [
  {
    key: "receipt",
    title: "Receipt",
    description: "Generate payment receipts for members with transaction details and amounts.",
    icon: <Receipt className="h-8 w-8 text-green-600" />,
    fields: [
      { name: "memberName", label: "Member Name", type: "text", required: true, placeholder: "Enter member name" },
      { name: "memberId", label: "Member ID", type: "text", placeholder: "Enter member ID (optional)" },
      { name: "receiptNumber", label: "Receipt Number", type: "text", placeholder: "Auto-generated if empty" },
      { name: "plotNumber", label: "Plot Number", type: "text", placeholder: "e.g. A-123" },
      { name: "amount", label: "Amount (PKR)", type: "number", required: true, placeholder: "0.00" },
      { name: "paymentDate", label: "Payment Date", type: "date", required: true },
      { name: "paymentMethod", label: "Payment Method", type: "text", placeholder: "e.g. Cash, Bank Transfer" },
    ],
  },
  {
    key: "invoice",
    title: "Invoice",
    description: "Create itemized invoices for dues, maintenance fees, and other charges.",
    icon: <FileText className="h-8 w-8 text-blue-600" />,
    fields: [
      { name: "memberName", label: "Member Name", type: "text", required: true, placeholder: "Enter member name" },
      { name: "memberId", label: "Member ID", type: "text", placeholder: "Enter member ID (optional)" },
      { name: "invoiceNumber", label: "Invoice Number", type: "text", placeholder: "Auto-generated if empty" },
      { name: "plotNumber", label: "Plot Number", type: "text", placeholder: "e.g. A-123" },
      { name: "dueDate", label: "Due Date", type: "date", required: true },
      { name: "items", label: "Description", type: "text", required: true, placeholder: "e.g. Monthly Maintenance" },
      { name: "amount", label: "Total Amount (PKR)", type: "number", required: true, placeholder: "0.00" },
    ],
  },
  {
    key: "certificate",
    title: "Certificate",
    description: "Generate membership or ownership certificates for society members.",
    icon: <FileCheck className="h-8 w-8 text-purple-600" />,
    fields: [
      { name: "memberName", label: "Member Name", type: "text", required: true, placeholder: "Enter member name" },
      { name: "memberCNIC", label: "CNIC", type: "text", required: true, placeholder: "Enter CNIC number" },
      { name: "certificateType", label: "Certificate Type", type: "text", required: true, placeholder: "e.g. Membership, Ownership" },
      { name: "issueDate", label: "Issue Date", type: "date", required: true },
      { name: "plotNumber", label: "Plot Number", type: "text", placeholder: "Enter plot number" },
      { name: "remarks", label: "Remarks", type: "text", placeholder: "Additional notes" },
    ],
  },
  {
    key: "noc",
    title: "NOC",
    description: "Issue No Objection Certificates for transfers, construction, or other purposes.",
    icon: <ScrollText className="h-8 w-8 text-orange-600" />,
    fields: [
      { name: "memberName", label: "Member Name", type: "text", required: true, placeholder: "Enter member name" },
      { name: "memberCNIC", label: "CNIC", type: "text", required: true, placeholder: "Enter CNIC number" },
      { name: "issueDate", label: "Issue Date", type: "date", required: true },
      { name: "validUntil", label: "Valid Until", type: "date" },
      { name: "purpose", label: "Purpose", type: "text", required: true, placeholder: "Describe the purpose" },
    ],
  },
  {
    key: "allotment-letter",
    title: "Allotment Letter",
    description: "Generate official allotment letters for plot or unit allocation to members.",
    icon: <Home className="h-8 w-8 text-teal-600" />,
    fields: [
      { name: "memberName", label: "Member Name", type: "text", required: true, placeholder: "Enter member name" },
      { name: "memberCNIC", label: "CNIC", type: "text", required: true, placeholder: "Enter CNIC number" },
      { name: "plotNumber", label: "Plot Number", type: "text", required: true, placeholder: "Enter plot number" },
      { name: "blockName", label: "Block Name", type: "text", required: true, placeholder: "Enter block name" },
      { name: "allotmentDate", label: "Allotment Date", type: "date", required: true },
      { name: "plotSize", label: "Plot Size", type: "text", placeholder: "e.g. 5 Marla, 10 Marla" },
    ],
  },
];

export function PDFGeneratorDashboard() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const generateReceipt = useGenerateReceipt();
  const generateInvoice = useGenerateInvoice();
  const generateCertificate = useGenerateCertificate();
  const generateNOC = useGenerateNOC();
  const generateAllotmentLetter = useGenerateAllotmentLetter();

  const getMutation = (template: TemplateType) => {
    switch (template) {
      case "receipt":
        return generateReceipt;
      case "invoice":
        return generateInvoice;
      case "certificate":
        return generateCertificate;
      case "noc":
        return generateNOC;
      case "allotment-letter":
        return generateAllotmentLetter;
    }
  };

  const handleOpenDialog = (template: TemplateType) => {
    setActiveTemplate(template);
    setFormData({});
  };

  const handleCloseDialog = () => {
    setActiveTemplate(null);
    setFormData({});
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Build the correct payload for each template type
  const buildPayload = (template: TemplateType, data: Record<string, string>): Record<string, unknown> => {
    const societyName = (user as any)?.societyName || "Society";
    const today = new Date().toISOString().split("T")[0];
    const amount = parseFloat(data.amount || "0");

    switch (template) {
      case "receipt":
        return {
          societyName,
          receiptNumber: data.receiptNumber || `REC-${Date.now()}`,
          memberName: data.memberName || data.memberId || "",
          memberId: data.memberId || "",
          amount,
          date: data.paymentDate || today,
          paymentMode: data.paymentMethod || "Cash",
          plotNumber: data.plotNumber || "",
          description: data.description || "",
        };
      case "invoice":
        return {
          societyName,
          invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
          invoiceDate: today,
          dueDate: data.dueDate || today,
          memberName: data.memberName || data.memberId || "",
          memberId: data.memberId || "",
          plotNumber: data.plotNumber || "",
          lineItems: [
            {
              description: data.items || "Charges",
              quantity: 1,
              unitPrice: amount,
              amount,
            },
          ],
          subtotal: amount,
          totalAmount: amount,
        };
      case "certificate":
        return {
          societyName,
          certificateNumber: data.certificateNumber || `CERT-${Date.now()}`,
          memberName: data.memberName || data.memberId || "",
          memberCNIC: data.memberCNIC || "",
          plotNumber: data.plotNumber || "",
          certificateType: data.certificateType || "Membership",
          issueDate: data.issueDate || today,
          remarks: data.remarks || "",
        };
      case "noc":
        return {
          societyName,
          nocNumber: data.nocNumber || `NOC-${Date.now()}`,
          memberName: data.memberName || data.memberId || "",
          memberCNIC: data.memberCNIC || "",
          purpose: data.purpose || "",
          issueDate: data.issueDate || today,
          validUntil: data.validUntil || "",
        };
      case "allotment-letter":
        return {
          societyName,
          letterNumber: data.letterNumber || `ALT-${Date.now()}`,
          memberName: data.memberName || data.memberId || "",
          memberCNIC: data.memberCNIC || "",
          plotNumber: data.plotNumber || "",
          blockName: data.blockName || "",
          plotSize: data.plotSize || "",
          allotmentDate: data.allotmentDate || today,
        };
      default:
        return data;
    }
  };

  const handleGenerate = async () => {
    if (!activeTemplate) return;

    const config = templates.find((t) => t.key === activeTemplate);
    if (!config) return;

    // Validate required fields
    const missingFields = config.fields
      .filter((f) => f.required && !formData[f.name]?.trim())
      .map((f) => f.label);

    if (missingFields.length > 0) {
      customToast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setIsGenerating(true);
      const mutation = getMutation(activeTemplate);
      const payload = buildPayload(activeTemplate, formData);

      const result = await mutation.mutateAsync(payload);

      // Handle HTML response (backend returns { success, data: { html } })
      if (result?.data?.data?.html) {
        const html = result.data.data.html;
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(html);
          win.document.close();
        }
        handleCloseDialog();
        return;
      }

      // Handle blob response
      const blob = result instanceof Blob ? result : new Blob([result], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);

      handleCloseDialog();
    } catch {
      // Error handled by mutation
    } finally {
      setIsGenerating(false);
    }
  };

  const currentConfig = activeTemplate
    ? templates.find((t) => t.key === activeTemplate)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PDF Generator</h1>
        <p className="text-muted-foreground">
          Generate documents from templates
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.key}
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                {template.icon}
                <CardTitle className="text-lg">{template.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
              <Button
                className="w-full"
                onClick={() => handleOpenDialog(template.key)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generation Dialog */}
      <Dialog open={!!activeTemplate} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentConfig?.icon}
              Generate {currentConfig?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentConfig?.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Generate PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
