"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createHours(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("hours").insert({
    employee_id: formData.get("employee_id") as string,
    site_id: formData.get("site_id") as string,
    date: formData.get("date") as string,
    hours: parseFloat(formData.get("hours") as string),
    notes: (formData.get("notes") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/hours");
  return { success: true };
}

export async function updateHours(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hours")
    .update({
      employee_id: formData.get("employee_id") as string,
      site_id: formData.get("site_id") as string,
      date: formData.get("date") as string,
      hours: parseFloat(formData.get("hours") as string),
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/hours");
  return { success: true };
}

export async function deleteHours(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("hours").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/hours");
  return { success: true };
}
