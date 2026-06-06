"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EmployeeStatus } from "@/lib/database.types";

export async function createEmployee(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("employees").insert({
    name: formData.get("name") as string,
    role: (formData.get("role") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    truck_id: (formData.get("truck_id") as string) || null,
    status: (formData.get("status") as EmployeeStatus) || "Active",
  });
  if (error) return { error: error.message };
  revalidatePath("/employees");
  return { success: true };
}

export async function updateEmployee(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("employees")
    .update({
      name: formData.get("name") as string,
      role: (formData.get("role") as string) || null,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      truck_id: (formData.get("truck_id") as string) || null,
      status: formData.get("status") as EmployeeStatus,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/employees");
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/employees");
  return { success: true };
}

export async function createTruck(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("trucks").insert({
    name: formData.get("name") as string,
    number: formData.get("number") as string,
    employee_id: (formData.get("employee_id") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/employees");
  return { success: true };
}
