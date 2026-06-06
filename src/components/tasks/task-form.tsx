"use client";
import { ErrorAlert } from "@/components/ui/error-alert";

import { useState, useTransition } from "react";
import { createTask, updateTask } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Employee, Site, TaskStatus } from "@/lib/database.types";

interface TaskRow {
  id: string;
  site_id: string;
  title: string;
  description: string | null;
  employee_id: string | null;
  status: TaskStatus;
  due_date: string | null;
}

interface TaskFormProps {
  task?: TaskRow;
  sites: Site[];
  employees: Employee[];
  onSuccess?: () => void;
}

export function TaskForm({ task, sites, employees, onSuccess }: TaskFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [siteId, setSiteId] = useState(task?.site_id || "");
  const [employeeId, setEmployeeId] = useState(task?.employee_id || "none");
  const [status, setStatus] = useState<TaskStatus>(task?.status || "ToDo");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!siteId) {
      setError("Site is required.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set("site_id", siteId);
    formData.set("employee_id", employeeId === "none" ? "" : employeeId);
    formData.set("status", status);
    startTransition(async () => {
      const result = task
        ? await updateTask(task.id, formData)
        : await createTask(formData);
      if (result?.error) setError(result.error);
      else onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" defaultValue={task?.title} required />
      </div>
      <div className="space-y-2">
        <Label>Site *</Label>
        <Select value={siteId} onValueChange={setSiteId}>
          <SelectTrigger>
            <SelectValue placeholder="Select site" />
          </SelectTrigger>
          <SelectContent>
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Assigned To</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ToDo">To Do</SelectItem>
              <SelectItem value="InProgress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <Input id="due_date" name="due_date" type="date" defaultValue={task?.due_date || ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={task?.description || ""} rows={3} />
      </div>
      {error && <ErrorAlert message={error} />}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : task ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
}
