"use client";

import { ActionBar } from "@/components/shared/PageTemplate";
import { EnhancedDataTable as DataTable, TableColumn } from "@/components/shared/DataTable/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useSendSMS,
  useSMSLogs,
  useSMSStats,
} from "@/lib/hooks/entities/useSMS";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDateTime, truncateText } from "@/lib/utils/format";
import { customToast } from "@/lib/utils/customToast";
import {
  CheckCircle2,
  Download,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface SMSLog {
  _id: string;
  recipient: string;
  message: string;
  messageType?: string;
  status: string;
  sentAt?: string;
  createdAt: string;
  deliveredAt?: string;
  errorMessage?: string;
}

const statusColors: Record<string, string> = {
  sent: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  queued: "bg-orange-100 text-orange-800",
};

const typeColors: Record<string, string> = {
  notification: "bg-blue-100 text-blue-800",
  alert: "bg-red-100 text-red-800",
  reminder: "bg-yellow-100 text-yellow-800",
  promotional: "bg-purple-100 text-purple-800",
  otp: "bg-green-100 text-green-800",
  general: "bg-gray-100 text-gray-800",
};

const smsColumns: TableColumn<SMSLog>[] = [
  {
    id: "recipient",
    header: "Recipient",
    cell: (row) => <span className="font-mono text-sm">{row.recipient}</span>,
    width: "140",
  },
  {
    id: "message",
    header: "Message",
    cell: (row) => (
      <span className="text-sm" title={row.message}>
        {truncateText(row.message, 50)}
      </span>
    ),
    width: "250",
    hideOnMobile: true,
  },
  {
    id: "messageType",
    header: "Type",
    cell: (row) => (
      <Badge className={typeColors[row.messageType || "general"] || "bg-gray-100 text-gray-800"}>
        {row.messageType?.charAt(0).toUpperCase() + (row.messageType?.slice(1) || "") || "General"}
      </Badge>
    ),
    width: "110",
    hideOnMobile: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <Badge className={statusColors[row.status] || "bg-gray-100 text-gray-800"}>
        {row.status?.charAt(0).toUpperCase() + row.status?.slice(1) || "N/A"}
      </Badge>
    ),
    width: "100",
  },
  {
    id: "sentAt",
    header: "Sent At",
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(row.sentAt || row.createdAt)}
      </span>
    ),
    width: "160",
    hideOnMobile: true,
  },
];

export function SMSDashboard() {
  const { user } = useAuth();
  const sendSMS = useSendSMS();

  const [filters, setLocalFilters] = useState<Record<string, unknown>>({
    page: 1,
    limit: 20,
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Send SMS form state
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("general");
  const [isSending, setIsSending] = useState(false);

  const { data, isLoading } = useSMSLogs(filters);
  const { data: stats } = useSMSStats(user?.societyId || "");

  const canSend =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSendSMS = async () => {
    if (!phone.trim()) {
      customToast.error("Please enter a recipient phone number");
      return;
    }
    if (!message.trim()) {
      customToast.error("Please enter a message");
      return;
    }
    try {
      setIsSending(true);
      await sendSMS.mutateAsync({
        phone: phone.trim(),
        message: message.trim(),
        messageType,
      });
      setPhone("");
      setMessage("");
      setMessageType("general");
    } catch {
      // Error handled by mutation
    } finally {
      setIsSending(false);
    }
  };

  const handleSearch = (search: string) => {
    setSearchValue(search);
    setLocalFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    if (status === "all") {
      setLocalFilters((prev) => {
        const { status: _, ...rest } = prev as Record<string, unknown> & { status?: string };
        return { ...rest, page: 1 };
      });
    } else {
      setLocalFilters((prev) => ({ ...prev, status, page: 1 }));
    }
  };

  const handleTypeFilter = (messageType: string) => {
    if (messageType === "all") {
      setLocalFilters((prev) => {
        const { messageType: _, ...rest } = prev as Record<string, unknown> & { messageType?: string };
        return { ...rest, page: 1 };
      });
    } else {
      setLocalFilters((prev) => ({ ...prev, messageType, page: 1 }));
    }
  };

  const handlePageChange = (page: number) => {
    setLocalFilters((prev) => ({ ...prev, page }));
  };

  const handleResetFilters = () => {
    setLocalFilters({ page: 1, limit: 20 });
    setSearchValue("");
    setSelectedIds([]);
  };

  const handleSelectionChange = (ids: string[]) => setSelectedIds(ids);

  const handleExportReport = () => {
    const csvData = [
      ["Recipient", "Message", "Type", "Status", "Sent At"],
      ...(data?.items || []).map((item: SMSLog) => [
        item.recipient,
        `"${item.message?.replace(/"/g, '""') || ""}"`,
        item.messageType || "-",
        item.status || "-",
        new Date(item.sentAt || item.createdAt).toLocaleDateString(),
      ]),
    ];
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sms-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tableConfig = {
    columns: smsColumns,
    filters: [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All Status", value: "all" },
          { label: "Sent", value: "sent" },
          { label: "Delivered", value: "delivered" },
          { label: "Failed", value: "failed" },
          { label: "Pending", value: "pending" },
          { label: "Queued", value: "queued" },
        ],
        onChange: handleStatusFilter,
      },
      {
        id: "messageType",
        label: "Type",
        type: "select" as const,
        options: [
          { label: "All Types", value: "all" },
          { label: "Notification", value: "notification" },
          { label: "Alert", value: "alert" },
          { label: "Reminder", value: "reminder" },
          { label: "Promotional", value: "promotional" },
          { label: "OTP", value: "otp" },
          { label: "General", value: "general" },
        ],
        onChange: handleTypeFilter,
      },
    ],
    enableActions: false,
    enableSelection: true,
    pagination: data?.pagination
      ? {
          currentPage: data.pagination.page,
          totalPages: data.pagination.pages,
          onPageChange: handlePageChange,
          pageSize: data.pagination.limit,
          onPageSizeChange: (size: number) =>
            setLocalFilters((prev) => ({ ...prev, limit: size, page: 1 })),
          totalItems: data.pagination.total,
        }
      : undefined,
    responsive: { showMobileView: true, stickyHeader: true },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMS Management</h1>
        <p className="text-muted-foreground">
          Send messages and track delivery logs
        </p>
      </div>

      {/* Send SMS Form */}
      {canSend && (
        <Card>
          <CardHeader icon={Send}>
            <CardTitle>Send SMS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Recipient Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g. 03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Message Type</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/500
                </p>
              </div>
              <div className="md:col-span-2">
                <Button
                  onClick={handleSendSMS}
                  disabled={isSending || !phone.trim() || !message.trim()}
                >
                  {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {isSending ? "Sending..." : "Send SMS"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Sent"
          value={stats?.totalSent ?? 0}
          icon={MessageSquare}
          iconBgClassName="bg-blue-100"
          iconClassName="text-blue-600"
          gradient="from-blue-500/10 to-transparent"
        />
        <SummaryCard
          title="Delivered"
          value={stats?.totalDelivered ?? 0}
          icon={CheckCircle2}
          iconBgClassName="bg-green-100"
          iconClassName="text-green-600"
          valueClassName="text-green-600"
          gradient="from-green-500/10 to-transparent"
        />
        <SummaryCard
          title="Failed"
          value={stats?.totalFailed ?? 0}
          icon={XCircle}
          iconBgClassName="bg-red-100"
          iconClassName="text-red-600"
          valueClassName="text-red-600"
          gradient="from-red-500/10 to-transparent"
        />
      </div>

      <ActionBar
        left={
          <>
            {Object.keys(filters).length > 2 && (
              <Button variant="glass" size="sm" onClick={handleResetFilters}>
                <RefreshCw className="size-4" />
                Reset Filters
              </Button>
            )}
            {selectedIds.length > 0 && (
              <span className="text-xs text-muted-foreground self-center">
                {selectedIds.length} selected
              </span>
            )}
            <Button variant="glass" size="sm" onClick={handleExportReport}>
              <Download className="size-4" />
              Export
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader icon={MessageSquare}>
          <CardTitle>SMS Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.items || []}
            config={tableConfig}
            isLoading={isLoading}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onSelectionChange={handleSelectionChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
