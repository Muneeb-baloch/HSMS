"use client";

import { SummaryCard } from "@/components/shared/SummaryCard/SummaryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParkingStats } from "@/lib/hooks/entities/useParking";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Car,
  CircleParking,
  KeySquare,
  Loader2,
  MapPin,
  TicketCheck,
} from "lucide-react";
import Link from "next/link";

export function ParkingDashboard() {
  const { user } = useAuth();
  const societyId = (user as Record<string, string>)?.societyId ?? "";
  const { data: stats, isLoading } = useParkingStats(societyId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parking Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of parking spots and passes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Spots"
          value={stats?.totalSpots ?? 0}
          icon={CircleParking}
          iconBgClassName="bg-blue-500/20"
          iconClassName="text-blue-500 dark:text-blue-400"
          gradient="from-blue-500/10 to-transparent"
        />
        <SummaryCard
          title="Occupied"
          value={stats?.occupied ?? 0}
          icon={Car}
          iconBgClassName="bg-red-500/20"
          iconClassName="text-red-500 dark:text-red-400"
          valueClassName="text-red-600"
          gradient="from-red-500/10 to-transparent"
        />
        <SummaryCard
          title="Available"
          value={stats?.available ?? 0}
          icon={MapPin}
          iconBgClassName="bg-green-500/20"
          iconClassName="text-green-500 dark:text-green-400"
          valueClassName="text-green-600"
          gradient="from-green-500/10 to-transparent"
        />
        <SummaryCard
          title="Active Passes"
          value={stats?.activePasses ?? 0}
          icon={TicketCheck}
          iconBgClassName="bg-purple-500/20"
          iconClassName="text-purple-500 dark:text-purple-400"
          valueClassName="text-purple-600"
          gradient="from-purple-500/10 to-transparent"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader icon={CircleParking}>
            <CardTitle>Parking Spots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View, assign, and manage all parking spots in the society.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/parking/spots">View Spots</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/parking/spots/create">Add Spot</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader icon={KeySquare}>
            <CardTitle>Parking Passes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Issue and manage parking passes for residents and visitors.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/parking/passes">View Passes</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/parking/passes/create">Issue Pass</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
