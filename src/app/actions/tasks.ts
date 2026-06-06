"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/database.types";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    site_id: formData.get("site_id") as string,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    employee_id: (formData.get("employee_id") as string) || null,
    status: (formData.get("status") as TaskStatus) || "ToDo",
    due_date: (formData.get("due_date") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/tasks");
  return { success: true };
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      site_id: formData.get("site_id") as string,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      employee_id: (formData.get("employee_id") as string) || null,
      status: formData.get("status") as TaskStatus,
      due_date: (formData.get("due_date") as string) || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/tasks");
  return { success: true };
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/tasks");
  return { success: true };
}
