"use client";
import { ErrorAlert } from "@/components/ui/error-alert";

import { useState, useTransition } from "react";
import { createEmployee, updateEmployee } from "@/app/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Employee, Truck } from "@/lib/database.types";

interface EmployeeFormProps {
  employee?: Employee;
  trucks: Truck[];
  onSuccess?: () => void;
}

export function EmployeeForm({ employee, trucks, onSuccess }: EmployeeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>(employee?.status || "Active");
  const [truckId, setTruckId] = useState(employee?.truck_id || "none");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("status", status);
    formData.set("truck_id", truckId === "none" ? "" : truckId);
    startTransition(async () => {
      const result = employee
        ? await updateEmployee(employee.id, formData)
        : await createEmployee(formData);
      if (result?.error) setError(result.error);
      else onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" defaultValue={employee?.name} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input id="role" name="role" defaultValue={employee?.role || ""} placeholder="Electrician" />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={employee?.phone || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={employee?.email || ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Assigned Truck</Label>
        <Select value={truckId} onValueChange={setTruckId}>
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {trucks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                Truck {t.number} — {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <ErrorAlert message={error} />}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : employee ? "Update" : "Add Employee"}
      </Button>
    </form>
  );
}
