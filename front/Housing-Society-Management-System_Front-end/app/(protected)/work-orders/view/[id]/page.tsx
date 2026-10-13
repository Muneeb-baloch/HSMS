"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkOrder } from "@/lib/hooks/entities/useVendor";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "open":
      return "success";
    case "bidding":
      return "warning";
    case "awarded":
    case "in-progress":
      return "default";
    case "completed":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const getBidStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "submitted":
      return "secondary";
    case "under-review":
      return "warning";
    case "accepted":
      return "success";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function ViewWorkOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: workOrder, isLoading, error } = useWorkOrder(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }

            {workOrder.completionNotes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Completion Notes</p>
                <p className="whitespace-pre-wrap">
                  {workOrder.completionNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bids */}
        <Card>
          <CardHeader>
            <CardTitle>
              Bids ({workOrder.bids?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workOrder.bids && workOrder.bids.length > 0 ? (
              <div className="space-y-4">
                {workOrder.bids.map((bid, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          {typeof bid.vendorId === "object"
                            ? (bid.vendorId as { vendorName?: string })
                                .vendorName || "Vendor"
                            : `Vendor ${index + 1}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {formatDate(bid.submittedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">
                          ${bid.amount.toLocaleString()}
                        </span>
                        <Badge variant={getBidStatusVariant(bid.status)}>
                          {bid.status?.replace(/-/g, " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mt-2">{bid.proposal}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No bids submitted yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
