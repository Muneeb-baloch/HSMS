"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, ClipboardList } from "lucide-react";

const cards = [
  {
    title: "Import Data",
    description: "Import members, plots, bills from CSV",
    icon: Upload,
    href: "/data-management/import",
    buttonLabel: "Start Import",
  },
  {
    title: "Export Data",
    description: "Export data to CSV or JSON",
    icon: Download,
    href: "/data-management/export",
    buttonLabel: "Export Now",
  },
  {
    title: "Import History",
    description: "View past imports and errors",
    icon: ClipboardList,
    href: "/data-management/logs",
    buttonLabel: "View Logs",
  },
] as const;

export default function DataManagementDashboard() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <h1 className="text-2xl font-bold tracking-tight">Data Management</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Icon className="text-primary h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => router.push(card.href)}
                >
                  {card.buttonLabel}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
