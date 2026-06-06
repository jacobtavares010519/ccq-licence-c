"use client";

import { useState } from "react";
import { Plus, Users, Phone, Mail, Truck as TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmployeeForm } from "./employee-form";
import { TruckForm } from "./truck-form";
import { deleteEmployee } from "@/app/actions/employees";
import type { Employee, Truck } from "@/lib/database.types";

interface EmployeesListProps {
  employees: Employee[];
  trucks: Truck[];
  onRefresh?: () => void;
}

export function EmployeesList({ employees, trucks, onRefresh }: EmployeesListProps) {
  const [addEmpOpen, setAddEmpOpen] = useState(false);
  const [addTruckOpen, setAddTruckOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);

  const active = employees.filter((e) => e.status === "Active");
  const inactive = employees.filter((e) => e.status === "Inactive");

  const truckMap = Object.fromEntries(trucks.map((t) => [t.id, `Truck ${t.number} — ${t.name}`]));

  async function handleDelete(emp: Employee) {
    if (!confirm(`Remove ${emp.name}?`)) return;
    await deleteEmployee(emp.id);
    onRefresh?.();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Dialog open={addTruckOpen} onOpenChange={setAddTruckOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <TruckIcon className="h-4 w-4" /> Add Truck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Truck</DialogTitle>
            </DialogHeader>
            <TruckForm employees={employees} onSuccess={() => { setAddTruckOpen(false); onRefresh?.(); }} />
          </DialogContent>
        </Dialog>
        <Dialog open={addEmpOpen} onOpenChange={setAddEmpOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
            </DialogHeader>
            <EmployeeForm trucks={trucks} onSuccess={() => { setAddEmpOpen(false); onRefresh?.(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactive.length})</TabsTrigger>
          <TabsTrigger value="trucks">Trucks ({trucks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <EmployeeGrid employees={active} trucks={truckMap} onEdit={setEditEmp} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="inactive">
          <EmployeeGrid employees={inactive} trucks={truckMap} onEdit={setEditEmp} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="trucks">
          <TruckGrid trucks={trucks} employees={employees} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editEmp} onOpenChange={(o) => !o && setEditEmp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editEmp && (
            <EmployeeForm
              employee={editEmp}
              trucks={trucks}
              onSuccess={() => { setEditEmp(null); onRefresh?.(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmployeeGrid({
  employees,
  trucks,
  onEdit,
  onDelete,
}: {
  employees: Employee[];
  trucks: Record<string, string>;
  onEdit: (e: Employee) => void;
  onDelete: (e: Employee) => void;
}) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <Users className="h-10 w-10 opacity-30" />
        <p className="text-sm">No employees</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {employees.map((emp) => (
        <Card key={emp.id} className="group">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[#0F172A]">{emp.name}</p>
                {emp.role && <p className="text-sm text-muted-foreground">{emp.role}</p>}
              </div>
              <Badge variant={emp.status === "Active" ? "success" : "secondary"}>
                {emp.status}
              </Badge>
            </div>
            <div className="space-y-1 text-xs text-slate-500">
              {emp.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> {emp.phone}
                </div>
              )}
              {emp.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> {emp.email}
                </div>
              )}
              {emp.truck_id && (
                <div className="flex items-center gap-1.5">
                  <TruckIcon className="h-3 w-3" /> {trucks[emp.truck_id] || "Truck"}
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => onEdit(emp)}>Edit</Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => onDelete(emp)}>
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TruckGrid({ trucks, employees }: { trucks: Truck[]; employees: Employee[] }) {
  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.name]));

  if (trucks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <TruckIcon className="h-10 w-10 opacity-30" />
        <p className="text-sm">No trucks</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {trucks.map((truck) => (
        <Card key={truck.id}>
          <CardContent className="p-4 flex items-center gap-3">
            <TruckIcon className="h-8 w-8 text-[#F59E0B]" />
            <div>
              <p className="font-semibold text-[#0F172A]">{truck.name}</p>
              <p className="text-sm text-muted-foreground">#{truck.number}</p>
              {truck.employee_id && (
                <p className="text-xs text-slate-500">{empMap[truck.employee_id]}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
