import { Badge } from "@/components/ui/badge";
import { RolesConfig } from "@auxilium/configs/roles";
import { Shield, ShieldUser, User, type LucideIcon } from "lucide-react";
import type { RoleDTO } from "../user.dto";

export function UserRoleBadge({ role }: { role: RoleDTO }) {
  let Icon: LucideIcon = User;

  if (role.roleId === RolesConfig.ADMIN) {
    Icon = Shield;
  } else if (role.roleId === RolesConfig.SUPERADMIN) {
    Icon = ShieldUser;
  }

  return (
    <Badge variant='outline'>
      {Icon && <Icon />}
      {role.name}
    </Badge>
  )
}
