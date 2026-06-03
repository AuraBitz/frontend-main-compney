"use client";

import { useEffect, useState } from "react";
import { Package, Users, HardDrive, Activity } from "lucide-react";
import { PageHeader } from "@/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils";
import type { ActivityItem, DashboardStats } from "@/types/user.types";

const statCards = [
  { key: "totalProducts" as const, label: "Total Products", icon: Package },
  { key: "activeUsers" as const, label: "Active Users", icon: Users },
  { key: "storageUsed" as const, label: "Storage Used", icon: HardDrive },
  { key: "activeSessions" as const, label: "Active Sessions", icon: Activity },
];

const DASHBOARD_STATS: DashboardStats = {
  totalProducts: 4,
  activeUsers: 4,
  storageUsed: "12.4 GB",
  activeSessions: 18,
};

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    action: "Updated product settings",
    user: "Company Admin",
    timestamp: "2026-06-03T07:30:00Z",
  },
  {
    id: "a2",
    action: "Uploaded quarterly report",
    user: "Product Manager",
    timestamp: "2026-06-02T15:10:00Z",
  },
  {
    id: "a3",
    action: "Created new user account",
    user: "Super Admin",
    timestamp: "2026-06-01T11:00:00Z",
  },
  {
    id: "a4",
    action: "Viewed analytics dashboard",
    user: "Read Only User",
    timestamp: "2026-05-30T09:45:00Z",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(DASHBOARD_STATS);
      setActivity(RECENT_ACTIVITY);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{loading ? "—" : stats?.[key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <ul className="space-y-4">
                {activity.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 text-sm">
                    <span>{item.action}</span>
                    <time className="text-muted-foreground">
                      {formatDate(item.timestamp)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>Compney admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Clients", "Plans", "Projects"].map((name) => (
              <div
                key={name}
                className="flex justify-between rounded-lg border p-3 text-sm"
              >
                <span>{name}</span>
                <Badge>Ready</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
