"use client";

import { MeetingView } from "@/components/meeting/MeetingView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeeting } from "@/lib/hooks/entities/useMeeting";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: meeting, isLoading, error } = useMeeting(id);

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (error || !meeting) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Meeting not found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Meetings
      </Button>
      <MeetingView meeting={meeting} meetingId={id} />
    </div>
  );
}
