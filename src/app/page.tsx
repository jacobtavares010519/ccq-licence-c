import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8]">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <div className="flex items-center gap-2">
          <Zap className="h-10 w-10 text-[#F59E0B]" />
          <span className="text-4xl font-bold tracking-tight text-[#0F172A]">
            NOVOLT
          </span>
        </div>
        <p className="max-w-sm text-lg text-slate-500">
          Electrical business management for Norca
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
