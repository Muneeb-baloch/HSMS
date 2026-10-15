"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SendNoticeDialog } from "@/components/defaulter/SendNoticeDialog";
import {
  useDefaulter,
  useSendNotice,
  useSetRemarks,
  useSetStatusOverride,
} from "@/lib/hooks/entities/useDefaulter";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DetailPageSkeleton } from "@/components/shared/PageSkeleton";

const statusColors: Record<string, string> = {
  Warning: "bg-yellow-100 text-yellow-800",
  Suspended: "bg-orange-100 text-orange-800",
  "Legal Action": "bg-red-100 text-red-800",
  Resolved: "bg-green-100 text-green-800",
};

export default function ViewDefaulterPage() {
  const router = useRouter();
  const params = useParams();
  const fileId = params.id as string;
  const { data: defaulter, isLoading, error } = useDefaulter(fileId);
  const { user } = useAuth();

  const setStatusOverride = useSetStatusOverride();
  const setRemarks = useSetRemarks();
  const sendNoticeMutation = useSendNotice();

  const [remarksDraft, setRemarksDraft] = useState("");
  const [sendNoticeOpen, setSendNoticeOpen] = useState(false);

  useEffect(() => {
    setRemarksDraft(defaulter?.remarks || "");
  }, [defaulter?.remarks]);

  const canUpdate =
    user && hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !defaulter) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "This file is not currently a defaulter (nothing overdue, or already resolved)."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusChange = (value: string) => {
    setStatusOverride.mutate({
      fileId,
      data: { status: value === "none" ? null : (value as any) },
    });
  };

  const handleSaveRemarks = () => {
    setRemarks.mutate({ fileId, data: { remarks: remarksDraft } });
  };

  const handleSendNoticeSubmit = async (data: {
    noticeType: "WARNING" | "FINAL" | "LEGAL";
    noticeContent: string;
    sendMethod: "EMAIL" | "SMS" | "LETTER" | "ALL";
  }) => {
    await sendNoticeMutation.mutateAsync({ fileId, data });
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {canUpdate && (
          <Button size="sm" onClick={() => setSendNoticeOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Send Notice
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">
          {defaulter.member?.memName || defaulter.member?.fullName || "Unknown Member"}
        </h1>
        <Badge className={statusColors[defaulter.actualStatus] || "bg-gray-100 text-gray-800"}>
          {defaulter.actualStatus}
        </Badge>
        {defaulter.statusOverride && defaulter.statusOverride !== defaulter.suggestedStatus && (
          <span className="text-sm text-muted-foreground">
            (suggested: {defaulter.suggestedStatus})
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">File</div>
            <div className="font-medium">
              <Link href={`/file/${defaulter.fileId}`} className="hover:underline">
                {defaulter.file?.fileRegNo || defaulter.fileId}
              </Link>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Plot</div>
            <div className="font-medium">{defaulter.plot?.plotNo || "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Member NIC</div>
            <div className="font-medium">{defaulter.member?.memNic || "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Mobile</div>
            <div className="font-medium">{defaulter.member?.mobileNo || "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Overdue Since</div>
            <div className="font-medium">{formatDate(defaulter.oldestUnpaidDueDate)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Days Overdue</div>
            <div className="font-medium">{defaulter.daysOverdue}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amount Owed</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Installments Overdue</div>
            <div className="font-bold text-lg">{formatCurrency(defaulter.installmentsOverdue)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Bills Overdue</div>
            <div className="font-bold text-lg">{formatCurrency(defaulter.billsOverdue)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Overdue</div>
            <div className="font-bold text-lg text-red-600">
              {formatCurrency(defaulter.totalOverdue)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Status Override</div>
            <Select
              value={defaulter.statusOverride || "none"}
              onValueChange={handleStatusChange}
              disabled={!canUpdate}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (use suggested: {defaulter.suggestedStatus})</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Legal Action">Legal Action</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm">
            <span className="text-muted-foreground">Notices sent: </span>
            <span className="font-medium">{defaulter.noticeSentCount}</span>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Remarks</div>
            <Textarea
              value={remarksDraft}
              onChange={(e) => setRemarksDraft(e.target.value)}
              rows={3}
              disabled={!canUpdate}
              placeholder="Internal notes about this defaulter..."
            />
            {canUpdate && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveRemarks}
                disabled={setRemarks.isPending || remarksDraft === (defaulter.remarks || "")}
              >
                {setRemarks.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Remarks
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <SendNoticeDialog
        open={sendNoticeOpen}
        onOpenChange={setSendNoticeOpen}
        defaulterName={defaulter.member?.memName || defaulter.member?.fullName}
        onSubmit={handleSendNoticeSubmit}
      />
    </div>
  );
}
