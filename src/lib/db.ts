import type {
  Site, Employee, Truck, Item, ItemLocation,
  InventoryMovement, Hours, Task,
  SiteStatus, EmployeeStatus, ItemCategory, ItemCondition,
  LocationType, MovementAction, TaskStatus,
} from "@/lib/database.types";

// ─── Fixed seed IDs ───────────────────────────────────────────────────────────
export const SEED_SITE_IDS = [
  "site-1111-1111-1111-111111111111",
  "site-2222-2222-2222-222222222222",
  "site-3333-3333-3333-333333333333",
];
export const SEED_ITEM_IDS = [
  "item-1111-1111-1111-111111111111",
  "item-2222-2222-2222-222222222222",
  "item-3333-3333-3333-333333333333",
  "item-4444-4444-4444-444444444444",
  "item-5555-5555-5555-555555555555",
];

const EMP = {
  marc: "emp-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  julie: "emp-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  alex: "emp-cccc-cccc-cccc-cccccccccccc",
};
const TRUCK = {
  t101: "truck-dddd-dddd-dddd-dddddddddddd",
  t102: "truck-eeee-eeee-eeee-eeeeeeeeeeee",
};

function seed() {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const sites: Site[] = [
    { id: SEED_SITE_IDS[0], name: "Downtown Office Tower", client: "Cadillac Fairview", address: "1000 De La Gauchetière W, Montréal", status: "Active", start_date: "2025-03-01", end_date: null, notes: "Floors 12-14 rewiring", created_at: now },
    { id: SEED_SITE_IDS[1], name: "Maple Street Complex", client: "Groupe Leclerc", address: "425 Maple Ave, Laval", status: "Active", start_date: "2025-05-10", end_date: null, notes: null, created_at: now },
    { id: SEED_SITE_IDS[2], name: "Industrial Park B", client: "Bombardier", address: "1 Bombardier Blvd, Mirabel", status: "Completed", start_date: "2024-11-01", end_date: "2025-02-28", notes: "Completed on schedule", created_at: now },
  ];
  const employees: Employee[] = [
    { id: EMP.marc, name: "Marc Tremblay", role: "Master Electrician", phone: "514-555-0101", email: "marc@norca.ca", truck_id: TRUCK.t101, status: "Active", created_at: now },
    { id: EMP.julie, name: "Julie Côté", role: "Electrician", phone: "514-555-0102", email: "julie@norca.ca", truck_id: TRUCK.t102, status: "Active", created_at: now },
    { id: EMP.alex, name: "Alex Bergeron", role: "Apprentice", phone: "514-555-0103", email: "alex@norca.ca", truck_id: null, status: "Active", created_at: now },
  ];
  const trucks: Truck[] = [
    { id: TRUCK.t101, name: "Ford F-250 White", number: "101", employee_id: EMP.marc, created_at: now },
    { id: TRUCK.t102, name: "Ram 1500 Black", number: "102", employee_id: EMP.julie, created_at: now },
  ];
  const items: Item[] = [
    { id: SEED_ITEM_IDS[0], name: "14/3 NMD-90 Wire (75m)", category: "Consumable", condition: null, supplier: "Rexel Canada", supplier_ref: "NMD14-3-75", min_qty: 2, created_at: now },
    { id: SEED_ITEM_IDS[1], name: "Square D 200A Main Panel", category: "Equipment", condition: "Good", supplier: "Gescan", supplier_ref: "SQD-QO130L200PG", min_qty: 0, created_at: now },
    { id: SEED_ITEM_IDS[2], name: "Fluke 117 Multimeter", category: "Tool", condition: "Good", supplier: "Anixter", supplier_ref: "FLUKE-117", min_qty: 0, created_at: now },
    { id: SEED_ITEM_IDS[3], name: "12/2 Romex Cable (30m)", category: "Consumable", condition: null, supplier: "Rexel Canada", supplier_ref: "ROM12-2-30", min_qty: 3, created_at: now },
    { id: SEED_ITEM_IDS[4], name: "Yellow Wire Nuts (500pk)", category: "Consumable", condition: null, supplier: "Gescan", supplier_ref: "WN-YEL-500", min_qty: 1, created_at: now },
  ];
  const itemLocations: ItemLocation[] = [
    { id: "loc-1", item_id: SEED_ITEM_IDS[0], location_type: "Office", location_id: null, quantity: 5, updated_at: now },
    { id: "loc-2", item_id: SEED_ITEM_IDS[0], location_type: "Truck", location_id: TRUCK.t101, quantity: 2, updated_at: now },
    { id: "loc-3", item_id: SEED_ITEM_IDS[1], location_type: "Office", location_id: null, quantity: 1, updated_at: now },
    { id: "loc-4", item_id: SEED_ITEM_IDS[2], location_type: "Truck", location_id: TRUCK.t101, quantity: 1, updated_at: now },
    { id: "loc-5", item_id: SEED_ITEM_IDS[2], location_type: "Truck", location_id: TRUCK.t102, quantity: 1, updated_at: now },
    { id: "loc-6", item_id: SEED_ITEM_IDS[3], location_type: "Office", location_id: null, quantity: 1, updated_at: now },
    { id: "loc-7", item_id: SEED_ITEM_IDS[4], location_type: "Office", location_id: null, quantity: 0, updated_at: now },
  ];
  const movements: InventoryMovement[] = [
    { id: "mov-1", item_id: SEED_ITEM_IDS[0], action: "Receive", from_loc_type: null, from_loc_id: null, to_loc_type: "Office", to_loc_id: null, quantity: 7, date: "2025-05-01", notes: "Initial stock", created_at: now },
    { id: "mov-2", item_id: SEED_ITEM_IDS[0], action: "Transfer", from_loc_type: "Office", from_loc_id: null, to_loc_type: "Truck", to_loc_id: TRUCK.t101, quantity: 2, date: "2025-05-15", notes: null, created_at: now },
    { id: "mov-3", item_id: SEED_ITEM_IDS[3], action: "Receive", from_loc_type: null, from_loc_id: null, to_loc_type: "Office", to_loc_id: null, quantity: 4, date: "2025-05-20", notes: null, created_at: now },
    { id: "mov-4", item_id: SEED_ITEM_IDS[3], action: "Consume", from_loc_type: "Office", from_loc_id: null, to_loc_type: null, to_loc_id: null, quantity: 3, date: "2025-05-22", notes: "Used at site", created_at: now },
  ];
  const hoursData: Hours[] = [
    { id: "hrs-1", employee_id: EMP.marc, site_id: SEED_SITE_IDS[0], date: today, hours: 8, notes: null, created_at: now },
    { id: "hrs-2", employee_id: EMP.julie, site_id: SEED_SITE_IDS[1], date: today, hours: 7.5, notes: null, created_at: now },
    { id: "hrs-3", employee_id: EMP.alex, site_id: SEED_SITE_IDS[0], date: today, hours: 8, notes: "Assisted Marc", created_at: now },
  ];
  const tasks: Task[] = [
    { id: "task-1", site_id: SEED_SITE_IDS[0], title: "Install panel on floor 12", description: "Replace 100A breaker panel with 200A Square D", employee_id: EMP.marc, status: "InProgress", due_date: today, created_at: now },
    { id: "task-2", site_id: SEED_SITE_IDS[0], title: "Run conduit to server room", description: null, employee_id: EMP.alex, status: "ToDo", due_date: null, created_at: now },
    { id: "task-3", site_id: SEED_SITE_IDS[1], title: "Rough-in unit 4B", description: "20 circuits per plan", employee_id: EMP.julie, status: "InProgress", due_date: today, created_at: now },
    { id: "task-4", site_id: SEED_SITE_IDS[1], title: "Inspect completed units", description: null, employee_id: null, status: "ToDo", due_date: null, created_at: now },
  ];

  set("sites", sites);
  set("employees", employees);
  set("trucks", trucks);
  set("items", items);
  set("item_locations", itemLocations);
  set("inventory_movements", movements);
  set("hours", hoursData);
  set("tasks", tasks);
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
function key(table: string) { return `novolt_${table}`; }

function get<T>(table: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key(table)) || "[]"); }
  catch { return []; }
}

function set<T>(table: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(table), JSON.stringify(data));
}

export function initDb() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("novolt_seeded")) return;
  seed();
  localStorage.setItem("novolt_seeded", "1");
}

function uid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function now() { return new Date().toISOString(); }

// ─── Sites ────────────────────────────────────────────────────────────────────
export function getSites(): Site[] { return get<Site>("sites").sort((a, b) => b.created_at.localeCompare(a.created_at)); }
export function getSite(id: string): Site | null { return get<Site>("sites").find((s) => s.id === id) ?? null; }
export function createSite(data: Omit<Site, "id" | "created_at">): Site {
  const row: Site = { ...data, id: uid(), created_at: now() };
  set("sites", [...get<Site>("sites"), row]);
  return row;
}
export function updateSite(id: string, data: Partial<Site>) {
  set("sites", get<Site>("sites").map((s) => s.id === id ? { ...s, ...data } : s));
}
export function deleteSite(id: string) {
  set("sites", get<Site>("sites").filter((s) => s.id !== id));
}

// ─── Employees ────────────────────────────────────────────────────────────────
export function getEmployees(): Employee[] { return get<Employee>("employees").sort((a, b) => a.name.localeCompare(b.name)); }
export function createEmployee(data: Omit<Employee, "id" | "created_at">): Employee {
  const row: Employee = { ...data, id: uid(), created_at: now() };
  set("employees", [...get<Employee>("employees"), row]);
  return row;
}
export function updateEmployee(id: string, data: Partial<Employee>) {
  set("employees", get<Employee>("employees").map((e) => e.id === id ? { ...e, ...data } : e));
}
export function deleteEmployee(id: string) {
  set("employees", get<Employee>("employees").filter((e) => e.id !== id));
}

// ─── Trucks ───────────────────────────────────────────────────────────────────
export function getTrucks(): Truck[] { return get<Truck>("trucks").sort((a, b) => a.number.localeCompare(b.number)); }
export function createTruck(data: Omit<Truck, "id" | "created_at">): Truck {
  const row: Truck = { ...data, id: uid(), created_at: now() };
  set("trucks", [...get<Truck>("trucks"), row]);
  return row;
}
export function updateTruck(id: string, data: Partial<Truck>) {
  set("trucks", get<Truck>("trucks").map((t) => t.id === id ? { ...t, ...data } : t));
}
export function deleteTruck(id: string) {
  set("trucks", get<Truck>("trucks").filter((t) => t.id !== id));
}

// ─── Items ────────────────────────────────────────────────────────────────────
export function getItems(): Item[] { return get<Item>("items").sort((a, b) => a.name.localeCompare(b.name)); }
export function getItem(id: string): Item | null { return get<Item>("items").find((i) => i.id === id) ?? null; }
export function createItem(data: Omit<Item, "id" | "created_at">): Item {
  const row: Item = { ...data, id: uid(), created_at: now() };
  set("items", [...get<Item>("items"), row]);
  return row;
}
export function updateItem(id: string, data: Partial<Item>) {
  set("items", get<Item>("items").map((i) => i.id === id ? { ...i, ...data } : i));
}
export function deleteItem(id: string) {
  set("items", get<Item>("items").filter((i) => i.id !== id));
  set("item_locations", get<ItemLocation>("item_locations").filter((l) => l.item_id !== id));
  set("inventory_movements", get<InventoryMovement>("inventory_movements").filter((m) => m.item_id !== id));
}

// ─── Item Locations ───────────────────────────────────────────────────────────
export function getItemLocations(): ItemLocation[] { return get<ItemLocation>("item_locations"); }
export function getLocationQty(item_id: string, loc_type: LocationType, loc_id: string | null): number {
  const locs = get<ItemLocation>("item_locations");
  const loc = locs.find((l) => l.item_id === item_id && l.location_type === loc_type && (l.location_id ?? null) === (loc_id ?? null));
  return loc?.quantity ?? 0;
}
function adjustLocationQty(item_id: string, loc_type: LocationType, loc_id: string | null, delta: number) {
  const locs = get<ItemLocation>("item_locations");
  const idx = locs.findIndex((l) => l.item_id === item_id && l.location_type === loc_type && (l.location_id ?? null) === (loc_id ?? null));
  if (idx >= 0) {
    locs[idx] = { ...locs[idx], quantity: locs[idx].quantity + delta, updated_at: now() };
  } else if (delta > 0) {
    locs.push({ id: uid(), item_id, location_type: loc_type, location_id: loc_id, quantity: delta, updated_at: now() });
  }
  set("item_locations", locs.filter((l) => l.quantity > 0));
}

// ─── Inventory Movements ──────────────────────────────────────────────────────
export function getMovements(item_id?: string): InventoryMovement[] {
  const all = get<InventoryMovement>("inventory_movements").sort((a, b) => b.created_at.localeCompare(a.created_at));
  return item_id ? all.filter((m) => m.item_id === item_id) : all;
}
export function recordMovement(data: {
  item_id: string;
  action: MovementAction;
  from_loc_type?: LocationType;
  from_loc_id?: string | null;
  to_loc_type?: LocationType;
  to_loc_id?: string | null;
  quantity: number;
  date: string;
  notes?: string;
}): { error?: string; success?: boolean } {
  if (data.quantity <= 0) return { error: "Quantity must be greater than zero." };

  if (data.from_loc_type) {
    const available = getLocationQty(data.item_id, data.from_loc_type, data.from_loc_id ?? null);
    if (available < data.quantity) {
      return { error: `Only ${available} units available at that location.` };
    }
    adjustLocationQty(data.item_id, data.from_loc_type, data.from_loc_id ?? null, -data.quantity);
  }
  if (data.to_loc_type) {
    adjustLocationQty(data.item_id, data.to_loc_type, data.to_loc_id ?? null, data.quantity);
  }

  const row: InventoryMovement = {
    id: uid(),
    item_id: data.item_id,
    action: data.action,
    from_loc_type: data.from_loc_type ?? null,
    from_loc_id: data.from_loc_id ?? null,
    to_loc_type: data.to_loc_type ?? null,
    to_loc_id: data.to_loc_id ?? null,
    quantity: data.quantity,
    date: data.date,
    notes: data.notes ?? null,
    created_at: now(),
  };
  set("inventory_movements", [...get<InventoryMovement>("inventory_movements"), row]);
  return { success: true };
}

// ─── Hours ────────────────────────────────────────────────────────────────────
export function getHours(): Hours[] { return get<Hours>("hours").sort((a, b) => b.date.localeCompare(a.date)); }
export function createHours(data: Omit<Hours, "id" | "created_at">): Hours {
  const row: Hours = { ...data, id: uid(), created_at: now() };
  set("hours", [...get<Hours>("hours"), row]);
  return row;
}
export function updateHours(id: string, data: Partial<Hours>) {
  set("hours", get<Hours>("hours").map((h) => h.id === id ? { ...h, ...data } : h));
}
export function deleteHours(id: string) {
  set("hours", get<Hours>("hours").filter((h) => h.id !== id));
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export function getTasks(): Task[] {
  return get<Task>("tasks").sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}
export function createTask(data: Omit<Task, "id" | "created_at">): Task {
  const row: Task = { ...data, id: uid(), created_at: now() };
  set("tasks", [...get<Task>("tasks"), row]);
  return row;
}
export function updateTask(id: string, data: Partial<Task>) {
  set("tasks", get<Task>("tasks").map((t) => t.id === id ? { ...t, ...data } : t));
}
export function deleteTask(id: string) {
  set("tasks", get<Task>("tasks").filter((t) => t.id !== id));
}
