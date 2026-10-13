"use client";

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { hasPermission, UserRole } from "@/lib/constants/roles";
import {
  useAddAgendaItem,
  useUpdateMinutes,
  useRecordAttendance,
  useAddDecision,
  useCompleteMeeting,
} from "@/lib/hooks/entities/useMeeting";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { customToast } from "@/lib/utils/customToast";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Users,
  Vote,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";

interface AgendaItem {
  _id?: string;
  title: string;
  description?: string;
  presenter?: string;
  duration?: number;
  order?: number;
}

interface Attendee {
  _id?: string;
  memberId?: string | { _id: string; memName?: string; memEmail?: string };
  memberName?: string;
  status: string;
  proxyName?: string;
}

interface Decision {
  _id?: string;
  title: string;
  description?: string;
  votesFor?: number;
  votesAgainst?: number;
  abstentions?: number;
  result?: string;
}

interface MeetingData {
  _id: string;
  title: string;
  description?: string;
  meetingType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isOnline?: boolean;
  onlineLink?: string;
  status: string;
  quorumRequired?: number;
  quorumMet?: boolean;
  agenda?: AgendaItem[];
  attendees?: Attendee[];
  decisions?: Decision[];
  minutes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface MeetingViewProps {
  meeting: MeetingData;
  meetingId: string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  postponed: "bg-orange-100 text-orange-800",
};

const typeColors: Record<string, string> = {
  agm: "bg-purple-100 text-purple-800",
  special: "bg-red-100 text-red-800",
  committee: "bg-blue-100 text-blue-800",
  emergency: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800",
};

const attendeeStatusColors: Record<string, string> = {
  invited: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  attended: "bg-emerald-100 text-emerald-800",
  absent: "bg-red-100 text-red-800",
  proxy: "bg-purple-100 text-purple-800",
};

export function MeetingView({ meeting, meetingId }: MeetingViewProps) {
  const { user } = useAuth();
  const addAgendaItem = useAddAgendaItem();
  const updateMinutes = useUpdateMinutes();
  const recordAttendance = useRecordAttendance();
  const addDecision = useAddDecision();
  const completeMeeting = useCompleteMeeting();

  const isAdmin =
    user &&
    hasPermission(user.role as UserRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  // Dialog states
  const [showAgendaDialog, setShowAgendaDialog] = useState(false);
  const { confirm } = useConfirm();
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [showMinutesDialog, setShowMinutesDialog] = useState(false);

  // Form states
  const [agendaForm, setAgendaForm] = useState({
    title: "",
    description: "",
    presenter: "",
    duration: "",
  });
  const [attendanceForm, setAttendanceForm] = useState({
    memberName: "",
    memberId: "",
    status: "invited",
  });
  const [decisionForm, setDecisionForm] = useState({
    title: "",
    description: "",
    votesFor: "",
    votesAgainst: "",
    abstentions: "",
  });
  const [minutesText, setMinutesText] = useState(meeting.minutes || "");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAgendaItem = async () => {
    if (!agendaForm.title.trim()) {
      customToast.error("Agenda item title is required");
      return;
    }
    try {
      setIsSubmitting(true);
      await addAgendaItem.mutateAsync({
        id: meetingId,
        data: {
          title: agendaForm.title.trim(),
          description: agendaForm.description.trim(),
          presenter: agendaForm.presenter.trim(),
          duration: agendaForm.duration ? parseInt(agendaForm.duration) : undefined,
        },
      });
      setAgendaForm({ title: "", description: "", presenter: "", duration: "" });
      setShowAgendaDialog(false);
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordAttendance = async () => {
    if (!attendanceForm.memberName.trim() && !attendanceForm.memberId.trim()) {
      customToast.error("Member name or ID is required");
      return;
    }
    try {
      setIsSubmitting(true);
      await recordAttendance.mutateAsync({
        id: meetingId,
        data: {
          memberName: attendanceForm.memberName.trim(),
          memberId: attendanceForm.memberId.trim() || undefined,
          status: attendanceForm.status,
        },
      });
      setAttendanceForm({ memberName: "", memberId: "", status: "invited" });
      setShowAttendanceDialog(false);
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDecision = async () => {
    if (!decisionForm.title.trim()) {
      customToast.error("Decision title is required");
      return;
    }
    try {
      setIsSubmitting(true);
      await addDecision.mutateAsync({
        id: meetingId,
        data: {
          title: decisionForm.title.trim(),
          description: decisionForm.description.trim(),
          votesFor: decisionForm.votesFor ? parseInt(decisionForm.votesFor) : 0,
          votesAgainst: decisionForm.votesAgainst ? parseInt(decisionForm.votesAgainst) : 0,
          abstentions: decisionForm.abstentions ? parseInt(decisionForm.abstentions) : 0,
        },
      });
      setDecisionForm({ title: "", description: "", votesFor: "", votesAgainst: "", abstentions: "" });
      setShowDecisionDialog(false);
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMinutes = async () => {
    try {
      setIsSubmitting(true);
      await updateMinutes.mutateAsync({
        id: meetingId,
        data: { minutes: minutesText },
      });
      setShowMinutesDialog(false);
    } catch {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteMeeting = async () => {
    if (!await confirm({ title: "Confirm", description: "Are you sure you want to mark this meeting as completed?" })) return;
    try {
      await completeMeeting.mutateAsync(meetingId);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{meeting.title}</h1>
            <Badge className={typeColors[meeting.meetingType] || "bg-gray-100 text-gray-800"}>
              {meeting.meetingType?.toUpperCase() || "N/A"}
            </Badge>
            <Badge className={statusColors[meeting.status] || "bg-gray-100 text-gray-800"}>
              {meeting.status?.replace("_", " ").charAt(0).toUpperCase() +
                meeting.status?.replace("_", " ").slice(1) || "N/A"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(meeting.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {meeting.startTime || "---"}{meeting.endTime ? ` - ${meeting.endTime}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {meeting.isOnline ? (
                meeting.onlineLink ? (
                  <a href={meeting.onlineLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Online Meeting
                  </a>
                ) : (
                  "Online"
                )
              ) : (
                meeting.location || "---"
              )}
            </span>
          </div>
          {meeting.description && (
            <p className="mt-3 text-muted-foreground">{meeting.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {isAdmin && meeting.status !== "completed" && meeting.status !== "cancelled" && (
            <>
              <Link href={`/meetings/edit/${meetingId}`}>
                <Button variant="outline">Edit</Button>
              </Link>
              <Button onClick={handleCompleteMeeting}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete Meeting
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agenda">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
        </TabsList>

        {/* Agenda Tab */}
        <TabsContent value="agenda">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Agenda Items
                </CardTitle>
                {isAdmin && meeting.status !== "completed" && (
                  <Button size="sm" onClick={() => setShowAgendaDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Agenda Item
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {meeting.agenda && meeting.agenda.length > 0 ? (
                <div className="space-y-4">
                  {meeting.agenda.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          {item.presenter && (
                            <span>Presenter: {item.presenter}</span>
                          )}
                          {item.duration && (
                            <span>Duration: {item.duration} min</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No agenda items added yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendees Tab */}
        <TabsContent value="attendees">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attendees ({meeting.attendees?.length ?? 0})
                  {meeting.quorumRequired != null && (
                    <span className="text-sm font-normal text-muted-foreground">
                      (Quorum: {meeting.quorumRequired} -{" "}
                      <span className={meeting.quorumMet ? "text-green-600" : "text-red-600"}>
                        {meeting.quorumMet ? "Met" : "Not Met"}
                      </span>)
                    </span>
                  )}
                </CardTitle>
                {isAdmin && meeting.status !== "completed" && (
                  <Button size="sm" onClick={() => setShowAttendanceDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Attendance
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {meeting.attendees && meeting.attendees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Member</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Proxy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meeting.attendees.map((attendee, index) => {
                        const memberName =
                          typeof attendee.memberId === "object"
                            ? attendee.memberId?.memName
                            : attendee.memberName;
                        return (
                          <tr key={attendee._id || index} className="border-b last:border-0">
                            <td className="py-3 px-4 font-medium">
                              {memberName || "Unknown Member"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  attendeeStatusColors[attendee.status] ||
                                  "bg-gray-100 text-gray-800"
                                }
                              >
                                {attendee.status?.charAt(0).toUpperCase() +
                                  attendee.status?.slice(1) || "N/A"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {attendee.proxyName || "---"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No attendees recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decisions Tab */}
        <TabsContent value="decisions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Decisions
                </CardTitle>
                {isAdmin && meeting.status !== "completed" && (
                  <Button size="sm" onClick={() => setShowDecisionDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Decision
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {meeting.decisions && meeting.decisions.length > 0 ? (
                <div className="space-y-4">
                  {meeting.decisions.map((decision, index) => (
                    <div
                      key={decision._id || index}
                      className="p-4 rounded-lg border bg-muted/30"
                    >
                      <h4 className="font-medium">{decision.title}</h4>
                      {decision.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {decision.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-3">
                        <span className="text-sm">
                          <span className="text-green-600 font-medium">
                            For: {decision.votesFor ?? 0}
                          </span>
                        </span>
                        <span className="text-sm">
                          <span className="text-red-600 font-medium">
                            Against: {decision.votesAgainst ?? 0}
                          </span>
                        </span>
                        <span className="text-sm">
                          <span className="text-gray-500 font-medium">
                            Abstained: {decision.abstentions ?? 0}
                          </span>
                        </span>
                        {decision.result && (
                          <Badge
                            className={
                              decision.result === "passed"
                                ? "bg-green-100 text-green-800"
                                : decision.result === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {decision.result.charAt(0).toUpperCase() +
                              decision.result.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No decisions recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Minutes Tab */}
        <TabsContent value="minutes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Meeting Minutes
                </CardTitle>
                {isAdmin && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setMinutesText(meeting.minutes || "");
                      setShowMinutesDialog(true);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Update Minutes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {meeting.minutes ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {meeting.minutes}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No minutes recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Agenda Item Dialog */}
      <Dialog open={showAgendaDialog} onOpenChange={setShowAgendaDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Agenda Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agenda-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="agenda-title"
                placeholder="Enter agenda item title"
                value={agendaForm.title}
                onChange={(e) =>
                  setAgendaForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agenda-description">Description</Label>
              <Textarea
                id="agenda-description"
                placeholder="Enter description"
                value={agendaForm.description}
                onChange={(e) =>
                  setAgendaForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agenda-presenter">Presenter</Label>
                <Input
                  id="agenda-presenter"
                  placeholder="Presenter name"
                  value={agendaForm.presenter}
                  onChange={(e) =>
                    setAgendaForm((prev) => ({ ...prev, presenter: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agenda-duration">Duration (minutes)</Label>
                <Input
                  id="agenda-duration"
                  type="number"
                  min="1"
                  placeholder="e.g. 15"
                  value={agendaForm.duration}
                  onChange={(e) =>
                    setAgendaForm((prev) => ({ ...prev, duration: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgendaDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAgendaItem} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Attendance Dialog */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="att-name">Member Name</Label>
              <Input
                id="att-name"
                placeholder="Enter member name"
                value={attendanceForm.memberName}
                onChange={(e) =>
                  setAttendanceForm((prev) => ({ ...prev, memberName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="att-id">Member ID (optional)</Label>
              <Input
                id="att-id"
                placeholder="Enter member ID"
                value={attendanceForm.memberId}
                onChange={(e) =>
                  setAttendanceForm((prev) => ({ ...prev, memberId: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="att-status">Attendance Status</Label>
              <Select
                value={attendanceForm.status}
                onValueChange={(value) =>
                  setAttendanceForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="attended">Attended</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="proxy">Proxy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordAttendance} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Decision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dec-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dec-title"
                placeholder="Enter decision title"
                value={decisionForm.title}
                onChange={(e) =>
                  setDecisionForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dec-description">Description</Label>
              <Textarea
                id="dec-description"
                placeholder="Enter description"
                value={decisionForm.description}
                onChange={(e) =>
                  setDecisionForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dec-for">Votes For</Label>
                <Input
                  id="dec-for"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={decisionForm.votesFor}
                  onChange={(e) =>
                    setDecisionForm((prev) => ({ ...prev, votesFor: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dec-against">Votes Against</Label>
                <Input
                  id="dec-against"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={decisionForm.votesAgainst}
                  onChange={(e) =>
                    setDecisionForm((prev) => ({ ...prev, votesAgainst: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dec-abstain">Abstentions</Label>
                <Input
                  id="dec-abstain"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={decisionForm.abstentions}
                  onChange={(e) =>
                    setDecisionForm((prev) => ({ ...prev, abstentions: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDecision} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Minutes Dialog */}
      <Dialog open={showMinutesDialog} onOpenChange={setShowMinutesDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Meeting Minutes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter meeting minutes..."
              value={minutesText}
              onChange={(e) => setMinutesText(e.target.value)}
              rows={12}
              className="resize-y"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMinutesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMinutes} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Minutes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
