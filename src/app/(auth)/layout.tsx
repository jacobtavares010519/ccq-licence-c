import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8] px-4">
      <div className="mb-8 flex items-center gap-2">
        <Zap className="h-8 w-8 text-[#F59E0B]" />
        <span className="text-2xl font-bold tracking-tight text-[#0F172A]">NOVOLT</span>
      </div>
      {children}
    </div>
  );
}
