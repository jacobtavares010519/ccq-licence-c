import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { EmployeesList } from "@/components/employees/employees-list";
import type { Employee, Truck } from "@/lib/database.types";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const [empRes, truckRes] = await Promise.all([
    supabase.from("employees").select("*").order("name"),
    supabase.from("trucks").select("*").order("number"),
  ]);

  return (
    <AppShell title="Employees">
      <div className="max-w-4xl mx-auto">
        <EmployeesList
          employees={(empRes.data || []) as Employee[]}
          trucks={(truckRes.data || []) as Truck[]}
        />
      </div>
    </AppShell>
  );
}
