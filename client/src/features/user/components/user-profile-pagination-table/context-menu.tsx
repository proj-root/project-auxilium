import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import type { DataTableContextMenuProps } from "@/components/ui/data-table";
import type { UserProfileDTO } from "../../user.dto";
import { Copy, Edit2, Trash2 } from "lucide-react";

export function UserProfilePaginationContextMenu({
  row,
  trigger
}: DataTableContextMenuProps<UserProfileDTO>) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-full w-full p-2">
        {trigger}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(row.profileId)} className="gap-2 cursor-pointer">
          <Copy /> Copy ID
        </ContextMenuItem>
        <ContextMenuItem className="gap-2 cursor-pointer">
          <Edit2 /> Edit
        </ContextMenuItem>
        <ContextMenuItem className="gap-2 cursor-pointer" variant={'destructive'}>
          <Trash2 /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}