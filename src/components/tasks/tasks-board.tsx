"use client";

import { useState, useTransition } from "react";
import { Plus, CheckSquare, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import { updateTaskStatus, deleteTask } from "@/app/actions/tasks";
import type { Employee, Site, TaskStatus } from "@/lib/database.types";

interface TaskRow {
  id: string;
  site_id: string;
  title: string;
  description: string | null;
  employee_id: string | null;
  status: TaskStatus;
  due_date: string | null;
  sites: { name: string } | null;
  employees: { name: string } | null;
}

interface TasksBoardProps {
  tasks: unknown[];
  sites: Site[];
  employees: Employee[];
  onRefresh?: () => void;
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "ToDo", label: "To Do", color: "bg-slate-100" },
  { status: "InProgress", label: "In Progress", color: "bg-amber-50" },
  { status: "Done", label: "Done", color: "bg-green-50" },
];

const statusVariant: Record<TaskStatus, "default" | "warning" | "success"> = {
  ToDo: "default",
  InProgress: "warning",
  Done: "success",
};

export function TasksBoard({ tasks, sites, employees, onRefresh }: TasksBoardProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const rows = tasks as TaskRow[];

  function moveTask(id: string, status: TaskStatus) {
    startTransition(async () => { await updateTaskStatus(id, status); onRefresh?.(); });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    startTransition(async () => { await deleteTask(id); onRefresh?.(); });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Task</DialogTitle>
            </DialogHeader>
            <TaskForm sites={sites} employees={employees} onSuccess={() => { setAddOpen(false); onRefresh?.(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map(({ status, label, color }) => {
          const col = rows.filter((t) => t.status === status);
          return (
            <div key={status} className={`rounded-lg p-3 ${color}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#0F172A]">{label}</h3>
                <span className="text-xs text-muted-foreground">{col.length}</span>
              </div>
              <div className="space-y-2">
                {col.map((task) => (
                  <Card key={task.id} className="shadow-sm">
                    <CardContent className="p-3 space-y-2">
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                      <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                        {task.sites && <span>{task.sites.name}</span>}
                        {task.employees && <span>· {task.employees.name}</span>}
                        {task.due_date && <span>· {task.due_date}</span>}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {COLUMNS.filter((c) => c.status !== status).map((c) => (
                          <Button
                            key={c.status}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            disabled={isPending}
                            onClick={() => moveTask(task.id, c.status)}
                          >
                            → {c.label}
                          </Button>
                        ))}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-slate-400 hover:text-slate-600 ml-auto"
                          onClick={() => setEditTask(task)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-red-400 hover:text-red-600"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {col.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <TaskForm
              task={editTask}
              sites={sites}
              employees={employees}
              onSuccess={() => { setEditTask(null); onRefresh?.(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
