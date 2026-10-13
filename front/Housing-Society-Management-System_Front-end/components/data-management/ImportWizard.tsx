"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  useImportTemplate,
  useImportData,
} from "@/lib/hooks/entities/useBulkOperations";

const ENTITY_TYPES = [
  { value: "members", label: "Members" },
  { value: "plots", label: "Plots" },
  { value: "bills", label: "Bills" },
];

interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

function parseCSV(text: string): ParsedCSV {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(",").map((c) => c.trim()));
  return { headers, rows };
}

type WizardStep = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Select Entity",
  2: "Upload File",
  3: "Preview & Validate",
  4: "Import",
};

export default function ImportWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [entityType, setEntityType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<ParsedCSV | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: template, isLoading: templateLoading } =
    useImportTemplate(entityType);
  const importMutation = useImportData();

  const handleFileRead = useCallback(async (f: File) => {
    setFile(f);
    const text = await f.text();
    setCsvText(text);
    const result = parseCSV(text);
    setParsed(result);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.name.endsWith(".csv")) {
        handleFileRead(droppedFile);
      }
    },
    [handleFileRead]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) {
        handleFileRead(selected);
      }
    },
    [handleFileRead]
  );

  const handleDownloadTemplate = useCallback(() => {
    if (!template) return;
    const content = template.csvHeader + "\n" + template.exampleData;
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityType}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [template, entityType]);

  const validationErrors = useMemo(() => {
    if (!parsed || !template) return [];
    const errors: { row: number; field: string; message: string }[] = [];
    const requiredColumns = template.columns
      .filter((c) => c.required)
      .map((c) => c.key);

    for (const reqCol of requiredColumns) {
      const colIndex = parsed.headers.indexOf(reqCol);
      if (colIndex === -1) {
        errors.push({
          row: 0,
          field: reqCol,
          message: `Missing required column: ${reqCol}`,
        });
      }
    }

    parsed.rows.forEach((row, rowIdx) => {
      for (const reqCol of requiredColumns) {
        const colIndex = parsed.headers.indexOf(reqCol);
        if (colIndex !== -1 && (!row[colIndex] || row[colIndex].length === 0)) {
          errors.push({
            row: rowIdx + 2,
            field: reqCol,
            message: `Empty required field "${reqCol}"`,
          });
        }
      }
    });

    return errors;
  }, [parsed, template]);

  const validRowCount = parsed
    ? parsed.rows.length -
      new Set(validationErrors.filter((e) => e.row > 0).map((e) => e.row)).size
    : 0;

  const handleStartImport = useCallback(() => {
    if (!entityType || !csvText) return;
    const societyId =
      typeof window !== "undefined"
        ? localStorage.getItem("societyId") || ""
        : "";
    importMutation.mutate({
      entityType,
      societyId,
      csvData: csvText,
    });
  }, [entityType, csvText, importMutation]);

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!entityType;
      case 2:
        return !!file && !!parsed;
      case 3:
        return validationErrors.filter((e) => e.row === 0).length === 0;
      case 4:
        return false;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (step < 4) setStep((step + 1) as WizardStep);
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as WizardStep);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {([1, 2, 3, 4] as WizardStep[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                s
              )}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                s === step ? "font-semibold" : "text-muted-foreground"
              }`}
            >
              {STEP_LABELS[s]}
            </span>
            {s < 4 && (
              <div className="bg-border mx-2 hidden h-px w-8 sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 - Select Entity */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Entity Type</CardTitle>
            <CardDescription>
              Choose the type of data you want to import.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((et) => (
                  <SelectItem key={et.value} value={et.value}>
                    {et.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {entityType && (
              <Button
                variant="outline"
                className="w-fit"
                onClick={handleDownloadTemplate}
                disabled={templateLoading || !template}
              >
                {templateLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download Template
              </Button>
            )}

            {template && (
              <div className="text-muted-foreground text-sm">
                <p className="font-medium">Template columns:</p>
                <ul className="mt-1 list-inside list-disc">
                  {template.columns.map((col) => (
                    <li key={col.key}>
                      {col.label}
                      {col.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                      <span className="ml-1 opacity-60">
                        (e.g. {col.example})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2 - Upload File */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Drag and drop a CSV file or click to browse.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div
              className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="text-muted-foreground mb-4 h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                Drag and drop your CSV file here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {file && parsed && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <FileText className="text-primary h-8 w-8" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {(file.size / 1024).toFixed(1)} KB &middot;{" "}
                    {parsed.rows.length} data rows
                  </p>
                </div>
                <Badge variant="secondary">Ready</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3 - Preview & Validate */}
      {step === 3 && parsed && (
        <Card>
          <CardHeader>
            <CardTitle>Preview & Validate</CardTitle>
            <CardDescription>
              Review the first 5 rows and check for errors.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Validation Summary */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">{validRowCount} valid rows</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">
                  {validationErrors.length} error
                  {validationErrors.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                <FileText className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">{parsed.rows.length} total rows</span>
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {parsed.headers.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.rows.slice(0, 5).map((row, rowIdx) => (
                    <TableRow key={rowIdx}>
                      <TableCell className="text-muted-foreground">
                        {rowIdx + 2}
                      </TableCell>
                      {row.map((cell, cellIdx) => (
                        <TableCell key={cellIdx}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsed.rows.length > 5 && (
              <p className="text-muted-foreground text-xs">
                Showing 5 of {parsed.rows.length} rows
              </p>
            )}

            {/* Errors List */}
            {validationErrors.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Validation Errors
                </h3>
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {validationErrors.map((err, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 border-b px-3 py-2 text-sm last:border-b-0"
                    >
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                      <span>
                        {err.row > 0 ? `Row ${err.row}: ` : ""}
                        {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4 - Import */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Start the import process for your{" "}
              {ENTITY_TYPES.find((e) => e.value === entityType)?.label || ""}{" "}
              data.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!importMutation.isPending && !importMutation.data && (
              <div className="flex flex-col items-center gap-4 py-6">
                <Upload className="text-primary h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                  Ready to import {parsed?.rows.length || 0} rows of{" "}
                  {ENTITY_TYPES.find((e) => e.value === entityType)?.label || ""}{" "}
                  data.
                </p>
                <Button onClick={handleStartImport} size="lg">
                  Start Import
                </Button>
              </div>
            )}

            {importMutation.isPending && (
              <div className="flex flex-col items-center gap-4 py-6">
                <Loader2 className="text-primary h-10 w-10 animate-spin" />
                <p className="text-sm font-medium">
                  Importing {parsed?.rows.length || 0} rows...
                </p>
                <Progress value={50} className="w-full max-w-md" />
                <p className="text-muted-foreground text-xs">
                  This may take a moment depending on the file size.
                </p>
              </div>
            )}

            {importMutation.data && (
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-lg font-semibold">Import Complete</p>
                    <p className="text-muted-foreground text-sm">
                      Import ID: {importMutation.data.importId}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-green-500">
                      {importMutation.data.success}
                    </p>
                    <p className="text-muted-foreground text-xs">Succeeded</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-red-500">
                      {importMutation.data.failed}
                    </p>
                    <p className="text-muted-foreground text-xs">Failed</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-muted-foreground text-2xl font-bold">
                      {importMutation.data.skipped}
                    </p>
                    <p className="text-muted-foreground text-xs">Skipped</p>
                  </div>
                </div>

                {importMutation.data.errors.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Import Errors ({importMutation.data.errors.length})
                    </h3>
                    <div className="max-h-48 overflow-y-auto rounded-md border">
                      {importMutation.data.errors.map((err, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 border-b px-3 py-2 text-sm last:border-b-0"
                        >
                          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                          <span>
                            Row {err.row}, {err.field}: {err.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {importMutation.isError && (
              <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Import Failed
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {importMutation.error?.message || "An error occurred"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={step === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {step < 4 && (
          <Button onClick={goNext} disabled={!canProceed()}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
