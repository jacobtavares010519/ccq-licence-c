"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SiteStatus } from "@/lib/database.types";

export async function createSite(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("sites").insert({
    name: formData.get("name") as string,
    client: (formData.get("client") as string) || null,
    address: (formData.get("address") as string) || null,
    status: (formData.get("status") as SiteStatus) || "Active",
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/sites");
  return { success: true };
}

export async function updateSite(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sites")
    .update({
      name: formData.get("name") as string,
      client: (formData.get("client") as string) || null,
      address: (formData.get("address") as string) || null,
      status: formData.get("status") as SiteStatus,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/sites");
  revalidatePath(`/sites/${id}`);
  return { success: true };
}

export async function deleteSite(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sites").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/sites");
  redirect("/sites");
}
