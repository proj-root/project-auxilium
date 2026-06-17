import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import type { DataTableContextMenuProps } from "@/components/ui/data-table";
import type { UserDTO } from "../../user.dto";
import { Copy, Edit2, Trash2 } from "lucide-react";

export function UserPaginationContextMenu({
  row,
  trigger
}: DataTableContextMenuProps<UserDTO>) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-full w-full p-2">
        {trigger}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(row.id)} className="gap-2 cursor-pointer">
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