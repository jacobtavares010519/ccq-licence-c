"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SiteForm } from "./site-form";
import { deleteSite } from "@/app/actions/sites";
import { updateTaskStatus } from "@/app/actions/tasks";
import type { Site, Task, Hours, Employee, TaskStatus, SiteStatus } from "@/lib/database.types";

interface SiteDetailProps {
  site: Site;
  tasks: Task[];
  hours: Hours[];
  employees: Employee[];
  onRefresh?: () => void;
}

const statusVariant: Record<SiteStatus, "success" | "warning" | "secondary"> = {
  Active: "success",
  Completed: "secondary",
  OnHold: "warning",
};

const taskStatusVariant: Record<TaskStatus, "default" | "warning" | "success"> = {
  ToDo: "default",
  InProgress: "warning",
  Done: "success",
};

export function SiteDetail({ site, tasks, hours, employees, onRefresh }: SiteDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalHours = hours.reduce((sum, h) => sum + h.hours, 0);

  function handleDelete() {
    if (!confirm(`Delete site "${site.name}"?`)) return;
    startTransition(async () => {
      await deleteSite(site.id);
      router.push("/sites");
    });
  }

  function cycleTaskStatus(taskId: string, current: TaskStatus) {
    const next: Record<TaskStatus, TaskStatus> = {
      ToDo: "InProgress",
      InProgress: "Done",
      Done: "ToDo",
    };
    startTransition(async () => { await updateTaskStatus(taskId, next[current]); onRefresh?.(); });
  }

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.name]));

  return (
    <div className="space-y-4">
      {/* Back + Actions */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/sites" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Sites
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl">{site.name}</CardTitle>
            <Badge variant={statusVariant[site.status]}>{site.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {site.client && <p><span className="text-muted-foreground">Client: </span>{site.client}</p>}
          {site.address && <p><span className="text-muted-foreground">Address: </span>{site.address}</p>}
          {site.start_date && (
            <p>
              <span className="text-muted-foreground">Dates: </span>
              {site.start_date}{site.end_date ? ` → ${site.end_date}` : ""}
            </p>
          )}
          {site.notes && (
            <>
              <Separator />
              <p className="text-muted-foreground whitespace-pre-line">{site.notes}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Tasks ({tasks.length})</CardTitle>
            <Link href={`/tasks?site=${site.id}`}>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <button
                      onClick={() => cycleTaskStatus(task.id, task.status)}
                      className="mt-0.5 shrink-0"
                    >
                      <CheckSquare className={`h-4 w-4 ${task.status === "Done" ? "text-green-500" : "text-slate-300"}`} />
                    </button>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${task.status === "Done" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      {task.employee_id && (
                        <p className="text-xs text-muted-foreground">{empMap[task.employee_id]}</p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">{task.due_date}</span>
                    )}
                    <Badge variant={taskStatusVariant[task.status]}>{task.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Hours Logged</CardTitle>
            <span className="text-lg font-bold text-[#0F172A]">{totalHours}h</span>
          </div>
        </CardHeader>
        <CardContent>
          {hours.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hours logged yet</p>
          ) : (
            <div className="space-y-1">
              {hours.slice(0, 10).map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                  <span className="text-muted-foreground">{h.date}</span>
                  <span>{(h as unknown as Record<string, { name: string }>).employees?.name ?? "—"}</span>
                  <span className="font-semibold">{h.hours}h</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Site</DialogTitle>
          </DialogHeader>
          <SiteForm site={site} onSuccess={() => { setEditOpen(false); onRefresh?.(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
