import { cn } from "@/lib/utils";
import { Link } from "react-router";

export function VersionInfo({ className }: { className?: string; }) {
  return (
    <div className={cn('text-muted-foreground text-sm flex flex-row justify-between', className)}>
      <Link to={'/changelog'} target="_blank" title="View Changelog" className="underline">Changelog</Link>
      {/* TODO: Find a more efficient way to handle this */}
      <h1>v0.4.0-alpha</h1>
    </div>
  )
}