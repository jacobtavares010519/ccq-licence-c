import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Dashboard } from "@/components/dashboard/dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Calculate date range for this week
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  const mondayStr = monday.toISOString().split("T")[0];

  const [
    sitesRes,
    tasksRes,
    hoursRes,
    itemsRes,
    locationsRes,
    movementsRes,
  ] = await Promise.all([
    supabase.from("sites").select("id, name, status, client"),
    supabase.from("tasks").select("id, title, status, due_date, site_id, sites(name)").order("due_date").limit(10),
    supabase.from("hours").select("hours, date").gte("date", mondayStr),
    supabase.from("items").select("id, name, category, min_qty"),
    supabase.from("item_locations").select("item_id, quantity"),
    supabase
      .from("inventory_movements")
      .select("id, action, date, items(name), quantity")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const activeSites = (sitesRes.data || []).filter((s) => s.status === "Active");
  const openTasks = (tasksRes.data || []).filter((t) => t.status !== "Done");
  const hoursThisWeek = (hoursRes.data || []).reduce((sum: number, h: { hours: number }) => sum + h.hours, 0);

  // Low stock
  const items = itemsRes.data || [];
  const locs = locationsRes.data || [];
  const lowStock = items.filter((item) => {
    if (item.category !== "Consumable") return false;
    const total = locs.filter((l) => l.item_id === item.id).reduce((s: number, l: { quantity: number }) => s + l.quantity, 0);
    return total <= item.min_qty;
  });

  return (
    <AppShell title="Dashboard">
      <Dashboard
        activeSiteCount={activeSites.length}
        openTaskCount={openTasks.length}
        hoursThisWeek={hoursThisWeek}
        lowStockCount={lowStock.length}
        recentTasks={(tasksRes.data || []).slice(0, 5) as unknown[]}
        recentMovements={(movementsRes.data || []) as unknown[]}
        activeSites={(activeSites) as unknown[]}
        lowStockItems={(lowStock) as unknown[]}
      />
    </AppShell>
  );
}
