"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmployeesList } from "@/components/employees/employees-list";
import * as db from "@/lib/db";
import type { Employee, Truck } from "@/lib/database.types";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);

  const load = useCallback(() => {
    setEmployees(db.getEmployees());
    setTrucks(db.getTrucks());
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AppShell title="Employees">
      <div className="max-w-4xl mx-auto">
        <EmployeesList employees={employees} trucks={trucks} onRefresh={load} />
      </div>
    </AppShell>
  );
}
