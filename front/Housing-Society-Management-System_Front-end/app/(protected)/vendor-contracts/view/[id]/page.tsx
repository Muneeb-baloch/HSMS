"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVendorContract } from "@/lib/hooks/entities/useVendor";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "success" | "warning" => {
  switch (status) {
    case "active":
      return "success";
    case "draft":
      return "secondary";
    case "expired":
      return "warning";
    case "terminated":
      return "destructive";
    case "renewed":
      return "default";
    default:
      return "secondary";
  }
};

export default function ViewContractPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: contract, isLoading, error } = useVendorContract(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }
            </div>

            {contract.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="whitespace-pre-wrap">{contract.description}</p>
              </div>
            )}

            {contract.scope && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Scope</p>
                <p className="whitespace-pre-wrap">{contract.scope}</p>
              </div>
            )}

            {contract.terminationReason && (
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Termination Reason
                </p>
                <p className="whitespace-pre-wrap text-red-600">
                  {contract.terminationReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>
              Performance Reviews (
              {contract.performanceReviews?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contract.performanceReviews &&
            contract.performanceReviews.length > 0 ? (
              <div className="space-y-4">
                {contract.performanceReviews.map((review, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">
                          {review.rating}/5
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    <p className="text-sm">{review.comments}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No performance reviews yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{formatDate(contract.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="font-medium">{formatDate(contract.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
