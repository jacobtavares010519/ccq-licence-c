export type ItemCategory = "Tool" | "Equipment" | "Consumable";
export type ItemCondition = "Good" | "NeedsRepair" | "Retired";
export type LocationType = "Office" | "Truck" | "Site";
export type SiteStatus = "Active" | "Completed" | "OnHold";
export type TaskStatus = "ToDo" | "InProgress" | "Done";
export type EmployeeStatus = "Active" | "Inactive";
export type MovementAction = "Receive" | "Transfer" | "Consume";

export interface Site {
  id: string;
  name: string;
  client: string | null;
  address: string | null;
  status: SiteStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  truck_id: string | null;
  status: EmployeeStatus;
  created_at: string;
}

export interface Truck {
  id: string;
  name: string;
  number: string;
  employee_id: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  condition: ItemCondition | null;
  supplier: string | null;
  supplier_ref: string | null;
  min_qty: number;
  created_at: string;
}

export interface ItemLocation {
  id: string;
  item_id: string;
  location_type: LocationType;
  location_id: string | null;
  quantity: number;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  action: MovementAction;
  from_loc_type: LocationType | null;
  from_loc_id: string | null;
  to_loc_type: LocationType | null;
  to_loc_id: string | null;
  quantity: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface Hours {
  id: string;
  employee_id: string;
  site_id: string;
  date: string;
  hours: number;
  notes: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  site_id: string;
  title: string;
  description: string | null;
  employee_id: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
}

// Joined / enriched types used in UI
export interface ItemWithLocations extends Item {
  item_locations: ItemLocation[];
  total_quantity: number;
  is_low_stock: boolean;
}

export interface ItemMovementWithItem extends InventoryMovement {
  items: Pick<Item, "name" | "category">;
}

export interface HoursWithRelations extends Hours {
  employees: Pick<Employee, "name" | "role">;
  sites: Pick<Site, "name">;
}

export interface TaskWithRelations extends Task {
  sites: Pick<Site, "name">;
  employees: Pick<Employee, "name"> | null;
}
