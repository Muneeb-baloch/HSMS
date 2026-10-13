"use client";

import { MeetingForm } from "@/components/meeting/MeetingForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useMeeting,
  useUpdateMeeting,
} from "@/lib/hooks/entities/useMeeting";
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { customToast } from "@/lib/utils/customToast";
import { FormPageSkeleton } from '@/components/shared/PageSkeleton'

export default function EditMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const updateMutation = useUpdateMeeting();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const id = params.id as string;

  const { data: meeting, isLoading, error } = useMeeting(id);

  const canUpdate =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      await updateMutation.mutateAsync({ id, data });
      customToast.success("Meeting updated successfully");
      router.push("/meetings");
    } catch {
      customToast.error("Failed to update meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.back();

  if (!canUpdate) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to edit meetings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <FormPageSkeleton />
  }

  if (error || !meeting) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load meeting.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaultValues = {
    title: meeting.title || "",
    description: meeting.description || "",
    meetingType: meeting.meetingType || "general",
    date: meeting.date || "",
    startTime: meeting.startTime || "",
    endTime: meeting.endTime || "",
    location: meeting.location || "",
    isOnline: meeting.isOnline || false,
    onlineLink: meeting.onlineLink || "",
    quorumRequired: meeting.quorumRequired || 0,
  };

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Meetings
      </Button>
      <h1 className="text-3xl font-bold">Edit Meeting</h1>
      <p className="text-gray-500 mt-2">Update meeting information</p>
      <div className="mt-6 max-w-4xl">
        <MeetingForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
