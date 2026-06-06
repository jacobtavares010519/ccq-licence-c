"use client";

import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SitesList } from "@/components/sites/sites-list";
import * as db from "@/lib/db";
import type { Site } from "@/lib/database.types";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);

  const load = useCallback(() => { setSites(db.getSites()); }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <AppShell title="Job Sites">
      <div className="max-w-4xl mx-auto">
        <SitesList sites={sites} onRefresh={load} />
      </div>
    </AppShell>
  );
}
