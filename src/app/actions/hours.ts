import * as db from "@/lib/db";

type R = Promise<{ error?: string; success?: boolean }>;

export async function createHours(formData: FormData): R {
  const hours = parseFloat(formData.get("hours") as string);
  if (isNaN(hours) || hours <= 0) return { error: "Hours must be greater than zero." };
  db.createHours({
    employee_id: formData.get("employee_id") as string,
    site_id: formData.get("site_id") as string,
    date: formData.get("date") as string,
    hours,
    notes: (formData.get("notes") as string) || null,
  });
  return { success: true };
}

export async function updateHours(id: string, formData: FormData): R {
  const hours = parseFloat(formData.get("hours") as string);
  if (isNaN(hours) || hours <= 0) return { error: "Hours must be greater than zero." };
  db.updateHours(id, {
    employee_id: formData.get("employee_id") as string,
    site_id: formData.get("site_id") as string,
    date: formData.get("date") as string,
    hours,
    notes: (formData.get("notes") as string) || null,
  });
  return { success: true };
}

export async function deleteHours(id: string): R {
  db.deleteHours(id);
  return { success: true };
}
