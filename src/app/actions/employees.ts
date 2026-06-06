import * as db from "@/lib/db";
import type { EmployeeStatus } from "@/lib/database.types";

type R = Promise<{ error?: string; success?: boolean }>;

export async function createEmployee(formData: FormData): R {
  db.createEmployee({
    name: formData.get("name") as string,
    role: (formData.get("role") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    truck_id: (formData.get("truck_id") as string) || null,
    status: (formData.get("status") as EmployeeStatus) || "Active",
  });
  return { success: true as const };
}

export async function updateEmployee(id: string, formData: FormData): R {
  db.updateEmployee(id, {
    name: formData.get("name") as string,
    role: (formData.get("role") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    truck_id: (formData.get("truck_id") as string) || null,
    status: formData.get("status") as EmployeeStatus,
  });
  return { success: true as const };
}

export async function deleteEmployee(id: string): R {
  db.deleteEmployee(id);
  return { success: true as const };
}

export async function createTruck(formData: FormData): R {
  db.createTruck({
    name: formData.get("name") as string,
    number: formData.get("number") as string,
    employee_id: (formData.get("employee_id") as string) || null,
  });
  return { success: true as const };
}

export async function updateTruck(id: string, formData: FormData): R {
  db.updateTruck(id, {
    name: formData.get("name") as string,
    number: formData.get("number") as string,
    employee_id: (formData.get("employee_id") as string) || null,
  });
  return { success: true as const };
}

export async function deleteTruck(id: string): R {
  db.deleteTruck(id);
  return { success: true as const };
}
