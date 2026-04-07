import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingComponent({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full h-full items-center justify-center", className)}>
      <div className="flex flex-row gap-4 items-center">
        <Loader2 className="size-4 animate-spin" />
        <h1 className="text-xl font-semibold">Loading...</h1>
      </div>
    </div>
  );
}
