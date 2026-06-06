import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { SiteDetail } from "@/components/sites/site-detail";
import type { Site, Task, Hours, Employee } from "@/lib/database.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SiteDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [siteRes, tasksRes, hoursRes, employeesRes] = await Promise.all([
    supabase.from("sites").select("*").eq("id", id).single(),
    supabase.from("tasks").select("*").eq("site_id", id).order("due_date"),
    supabase
      .from("hours")
      .select("*, employees(name)")
      .eq("site_id", id)
      .order("date", { ascending: false }),
    supabase.from("employees").select("*").eq("status", "Active").order("name"),
  ]);

  if (siteRes.error || !siteRes.data) notFound();

  return (
    <AppShell title={siteRes.data.name}>
      <div className="max-w-4xl mx-auto">
        <SiteDetail
          site={siteRes.data as Site}
          tasks={(tasksRes.data || []) as Task[]}
          hours={(hoursRes.data || []) as Hours[]}
          employees={(employeesRes.data || []) as Employee[]}
        />
      </div>
    </AppShell>
  );
}
