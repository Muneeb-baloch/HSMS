"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useComplaint } from "@/lib/hooks/entities/useComplaint";
import { formatDate } from "@/lib/utils/format";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewComplaintPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: complaint, isLoading, error } = useComplaint(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }

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
