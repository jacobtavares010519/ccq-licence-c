"use client";
import { ErrorAlert } from "@/components/ui/error-alert";

import { useState, useTransition } from "react";
import { createTruck } from "@/app/actions/employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Employee } from "@/lib/database.types";

interface TruckFormProps {
  employees: Employee[];
  onSuccess?: () => void;
}

export function TruckForm({ employees, onSuccess }: TruckFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [employeeId, setEmployeeId] = useState("none");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("employee_id", employeeId === "none" ? "" : employeeId);
    startTransition(async () => {
      const result = await createTruck(formData);
      if (result?.error) setError(result.error);
      else onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Truck Name *</Label>
          <Input id="name" name="name" placeholder="F-150" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="number">Number *</Label>
          <Input id="number" name="number" placeholder="T1" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Assigned Employee</Label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {employees.filter((e) => e.status === "Active").map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <ErrorAlert message={error} />}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Add Truck"}
      </Button>
    </form>
  );
}
