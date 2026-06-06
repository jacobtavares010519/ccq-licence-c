import * as db from "@/lib/db";
import type { TaskStatus } from "@/lib/database.types";

type R = Promise<{ error?: string; success?: boolean }>;

export async function createTask(formData: FormData): R {
  db.createTask({
    site_id: formData.get("site_id") as string,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    employee_id: (formData.get("employee_id") as string) || null,
    status: (formData.get("status") as TaskStatus) || "ToDo",
    due_date: (formData.get("due_date") as string) || null,
  });
  return { success: true };
}

export async function updateTask(id: string, formData: FormData): R {
  db.updateTask(id, {
    site_id: formData.get("site_id") as string,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    employee_id: (formData.get("employee_id") as string) || null,
    status: formData.get("status") as TaskStatus,
    due_date: (formData.get("due_date") as string) || null,
  });
  return { success: true };
}

export async function updateTaskStatus(id: string, status: TaskStatus): R {
  db.updateTask(id, { status });
  return { success: true };
}

export async function deleteTask(id: string): R {
  db.deleteTask(id);
  return { success: true };
}
