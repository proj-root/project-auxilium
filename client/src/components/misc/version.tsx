import { cn } from "@/lib/utils";
import { Link } from "react-router";

export function VersionInfo({ className }: { className?: string; }) {
  return (
    <div className={cn('text-muted-foreground text-sm flex flex-row justify-between', className)}>
      <Link to={'/changelog'} target="_blank" title="View Changelog" className="underline">Changelog</Link>
      <h1>v1.0.0</h1>
    </div>
  )
}