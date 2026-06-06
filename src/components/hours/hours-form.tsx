"use client";
import { ErrorAlert } from "@/components/ui/error-alert";

import { useState, useTransition } from "react";
import { createHours } from "@/app/actions/hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Employee, Site } from "@/lib/database.types";

interface HoursFormProps {
  employees: Employee[];
  sites: Site[];
  onSuccess?: () => void;
}

export function HoursForm({ employees, sites, onSuccess }: HoursFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [employeeId, setEmployeeId] = useState("");
  const [siteId, setSiteId] = useState("");
  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!employeeId || !siteId) {
      setError("Employee and site are required.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set("employee_id", employeeId);
    formData.set("site_id", siteId);
    startTransition(async () => {
      const result = await createHours(formData);
      if (result?.error) setError(result.error);
      else onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Employee *</Label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Site *</Label>
        <Select value={siteId} onValueChange={setSiteId}>
          <SelectTrigger>
            <SelectValue placeholder="Select site" />
          </SelectTrigger>
          <SelectContent>
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input id="date" name="date" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hours">Hours *</Label>
          <Input id="hours" name="hours" type="number" min="0.5" max="24" step="0.5" placeholder="8" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      {error && <ErrorAlert message={error} />}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving…" : "Log Hours"}
      </Button>
    </form>
  );
}
