import * as db from "@/lib/db";
import type { SiteStatus } from "@/lib/database.types";

type R = Promise<{ error?: string; success?: boolean }>;

export async function createSite(formData: FormData): R {
  db.createSite({
    name: formData.get("name") as string,
    client: (formData.get("client") as string) || null,
    address: (formData.get("address") as string) || null,
    status: (formData.get("status") as SiteStatus) || "Active",
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  return { success: true };
}

export async function updateSite(id: string, formData: FormData): R {
  db.updateSite(id, {
    name: formData.get("name") as string,
    client: (formData.get("client") as string) || null,
    address: (formData.get("address") as string) || null,
    status: formData.get("status") as SiteStatus,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  return { success: true };
}

export async function deleteSite(id: string): R {
  db.deleteSite(id);
  return { success: true };
}
