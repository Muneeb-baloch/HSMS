"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useComplaint } from "@/lib/hooks/entities/useComplaint";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
  reopened: "bg-purple-100 text-purple-800",
  on_hold: "bg-slate-100 text-slate-800",
};

export default function ViewComplaintPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: complaint, isLoading } = useComplaint(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!complaint) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Complaint Not Found</CardTitle>
            <CardDescription>
              The requested complaint does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/complaints")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Complaints
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const member = typeof complaint.memId === "object" ? complaint.memId : null;
  const file = typeof complaint.fileId === "object" ? complaint.fileId : null;
  const category = typeof complaint.compCatId === "object" ? complaint.compCatId : null;
  const assignedTo = typeof complaint.assignedTo === "object" ? complaint.assignedTo : null;
  const status =
    complaint.status ||
    (typeof complaint.statusId === "object" ? complaint.statusId?.statusName : null) ||
    "Unknown";

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => router.push(`/complaints/edit/${id}`)}>
          Edit Complaint
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{complaint.compTitle}</CardTitle>
              <CardDescription className="mt-2">
                {category?.categoryName || "Unknown category"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={PRIORITY_COLORS[complaint.compPriority] || "bg-gray-100 text-gray-800"}>
                {complaint.compPriority}
              </Badge>
              <Badge className={STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}>
                {status}
              </Badge>
              {complaint.isEscalated && (
                <Badge className="bg-red-100 text-red-800">
                  Escalated (Level {complaint.escalationLevel})
                </Badge>
              )}
              {complaint.slaBreached && (
                <Badge className="bg-red-100 text-red-800">SLA Breached</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="whitespace-pre-wrap">{complaint.compDescription}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Member</p>
              <p className="font-medium">{member?.memName || "Unknown"}</p>
              {member?.memNic && (
                <p className="text-sm text-gray-500">NIC: {member.memNic}</p>
              )}
            </div>
            {file && (
              <div>
                <p className="text-sm text-gray-500">File</p>
                <p className="font-medium">
                  {file.fileRegNo || file.fileBarCode || "—"}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Assigned To</p>
              <p className="font-medium">
                {assignedTo ? `${assignedTo.firstName} ${assignedTo.lastName}` : "Unassigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date Submitted</p>
              <p className="font-medium">{formatDate(complaint.compDate)}</p>
            </div>
            {complaint.dueDate && (
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{formatDate(complaint.dueDate)}</p>
              </div>
            )}
            {complaint.resolutionDate && (
              <div>
                <p className="text-sm text-gray-500">Resolution Date</p>
                <p className="font-medium">{formatDate(complaint.resolutionDate)}</p>
              </div>
            )}
          </div>

          {complaint.resolutionNotes && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Resolution Notes</p>
              <p className="whitespace-pre-wrap">{complaint.resolutionNotes}</p>
            </div>
          )}

          {complaint.attachmentPaths && complaint.attachmentPaths.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {complaint.attachmentPaths.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Attachment {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
