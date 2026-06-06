"use client";

import Link from "next/link";
import {
  MapPin,
  CheckSquare,
  Clock,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  activeSiteCount: number;
  openTaskCount: number;
  hoursThisWeek: number;
  lowStockCount: number;
  recentTasks: unknown[];
  recentMovements: unknown[];
  activeSites: unknown[];
  lowStockItems: unknown[];
}

interface TaskRow {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  sites: { name: string } | null;
}

interface MovementRow {
  id: string;
  action: string;
  date: string;
  quantity: number;
  items: { name: string } | null;
}

interface SiteRow {
  id: string;
  name: string;
  client: string | null;
}

interface ItemRow {
  id: string;
  name: string;
  min_qty: number;
}

const taskStatusVariant: Record<string, "default" | "warning" | "success"> = {
  ToDo: "default",
  InProgress: "warning",
  Done: "success",
};

const movementColor: Record<string, string> = {
  Receive: "text-green-600",
  Transfer: "text-blue-600",
  Consume: "text-red-600",
};

export function Dashboard({
  activeSiteCount,
  openTaskCount,
  hoursThisWeek,
  lowStockCount,
  recentTasks,
  recentMovements,
  activeSites,
  lowStockItems,
}: DashboardProps) {
  const tasks = recentTasks as TaskRow[];
  const movements = recentMovements as MovementRow[];
  const sites = activeSites as SiteRow[];
  const lowItems = lowStockItems as ItemRow[];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Low stock banner */}
      {lowStockCount > 0 && (
        <Link href="/inventory?filter=lowstock">
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 hover:bg-amber-100 transition-colors">
            <TriangleAlert className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-semibold text-amber-800">{lowStockCount} item{lowStockCount > 1 ? "s" : ""} low on stock — </span>
              <span className="text-amber-700">{lowItems.map((i) => i.name).join(", ")}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-600 shrink-0" />
          </div>
        </Link>
      )}

      {/* KPI widgets */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Active Sites"
          value={activeSiteCount}
          icon={<MapPin className="h-5 w-5 text-[#F59E0B]" />}
          href="/sites"
        />
        <KpiCard
          label="Open Tasks"
          value={openTaskCount}
          icon={<CheckSquare className="h-5 w-5 text-[#F59E0B]" />}
          href="/tasks"
        />
        <KpiCard
          label="Hours This Week"
          value={`${hoursThisWeek}h`}
          icon={<Clock className="h-5 w-5 text-[#F59E0B]" />}
          href="/hours"
        />
        <KpiCard
          label="Low Stock Items"
          value={lowStockCount}
          icon={<TriangleAlert className={`h-5 w-5 ${lowStockCount > 0 ? "text-amber-500" : "text-[#F59E0B]"}`} />}
          href="/inventory"
          highlight={lowStockCount > 0}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Sites */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Sites</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sites">View all <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {sites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active sites</p>
            ) : (
              sites.slice(0, 5).map((s) => (
                <Link key={s.id} href={`/sites/${s.id}`}>
                  <div className="flex items-center justify-between rounded-md border border-border p-2.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#F59E0B]" />
                      <span className="text-sm font-medium">{s.name}</span>
                    </div>
                    {s.client && <span className="text-xs text-muted-foreground">{s.client}</span>}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Open Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Open Tasks</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">View all <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.filter((t) => t.status !== "Done").length === 0 ? (
              <p className="text-sm text-muted-foreground">No open tasks</p>
            ) : (
              tasks
                .filter((t) => t.status !== "Done")
                .slice(0, 5)
                .map((t) => (
                  <div key={t.id} className="flex items-start justify-between gap-2 rounded-md border border-border p-2.5">
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      {t.sites && <p className="text-xs text-muted-foreground">{t.sites.name}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={taskStatusVariant[t.status]}>{t.status}</Badge>
                      {t.due_date && <span className="text-xs text-muted-foreground">{t.due_date}</span>}
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Recent Inventory Movements */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Inventory</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/inventory">View all <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No movements recorded yet</p>
            ) : (
              <div className="space-y-2">
                {movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm rounded-md bg-slate-50 px-3 py-2">
                    <span className={`font-semibold w-20 ${movementColor[m.action]}`}>{m.action}</span>
                    <span className="flex-1">{m.items?.name ?? "—"}</span>
                    <span className="text-muted-foreground mr-4">×{m.quantity}</span>
                    <span className="text-muted-foreground">{m.date}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  href,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className={`hover:shadow-md transition-shadow ${highlight ? "border-amber-300" : ""}`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="shrink-0">{icon}</div>
          <div>
            <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
