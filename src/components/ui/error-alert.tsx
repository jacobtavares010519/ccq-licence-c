import { AlertCircle } from "lucide-react";

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
