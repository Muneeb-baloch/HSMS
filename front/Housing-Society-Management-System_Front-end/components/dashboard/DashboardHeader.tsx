"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconBell, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAnnouncements } from "@/lib/hooks/entities/useAnnouncements";
import { useComplaints } from "@/lib/hooks/entities/useComplaint";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function DashboardHeader() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const announcements = useAnnouncements({ page: 1, limit: 5 });
  const complaints = useComplaints({ page: 1, limit: 5 });

  const annItems = (announcements.data as { announcements?: Array<{ _id: string; title?: string; createdAt?: string }> })?.announcements ?? [];
  const compItems = complaints.data?.items ?? [];
  const hasNotifications = annItems.length > 0 || compItems.length > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) router.push(`/members?search=${encodeURIComponent(q)}`);
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={handleSearch}
        className={cn(
          "flex w-full flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm transition-all duration-200",
          searchFocused
            ? "border-purple-400 ring-2 ring-purple-500/20"
            : "focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20"
        )}
      >
        <IconSearch className="size-4 shrink-0 text-gray-400" aria-hidden />
        <Input
          type="search"
          placeholder="Search across Projects, Plots, Members, Complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="h-9 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
          aria-label="Search dashboard"
        />
      </form>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
            aria-label="Notifications"
          >
            <IconBell className="size-5" />
            {hasNotifications && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {annItems.length + compItems.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
          <div className="border-b px-3 py-2">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">Recent announcements & complaints</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {annItems.slice(0, 3).map((a) => (
              <DropdownMenuItem key={a._id} asChild>
                <Link
                  href="/announcements"
                  className="flex flex-col gap-0.5 px-3 py-2"
                >
                  <span className="font-medium">{a.title ?? "Announcement"}</span>
                  {a.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
            {(compItems as Array<{ _id: string; compTitle?: string; createdAt?: string }>).slice(0, 2).map((c) => (
              <DropdownMenuItem key={c._id} asChild>
                <Link href="/complaints" className="flex flex-col gap-0.5 px-3 py-2">
                  <span className="font-medium">{c.compTitle ?? "Complaint"}</span>
                  {c.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
            {!hasNotifications && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No recent notifications
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
