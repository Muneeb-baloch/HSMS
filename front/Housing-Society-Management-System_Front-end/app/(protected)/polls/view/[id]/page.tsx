"use client";

import { PollView } from "@/components/poll/PollView";
import { useParams } from "next/navigation";

export default function ViewPollPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <PollView id={id} />
    </div>
  );
}
