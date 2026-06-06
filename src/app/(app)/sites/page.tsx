import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { SitesList } from "@/components/sites/sites-list";
import type { Site } from "@/lib/database.types";

export default async function SitesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AppShell title="Job Sites">
      <div className="max-w-4xl mx-auto">
        <SitesList sites={(data || []) as Site[]} />
      </div>
    </AppShell>
  );
}
