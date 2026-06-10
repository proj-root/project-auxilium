import type { ColumnDef } from '@tanstack/react-table';
import type { UserDTO } from '../../user.dto';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { BadgeCheck } from 'lucide-react';
import { UserRoleBadge } from '../role-badge';

export const columns: ColumnDef<UserDTO>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader title='Name' column={column} />
    ),
  },
  {
    id: 'adminNumber',
    accessorFn: (row) => row.userProfile.adminNumber,
    header: ({ column }) => (
      <DataTableColumnHeader title='Admin Number' column={column} />
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader title='Email' column={column} />
    ),
    cell: ({ row }) => {
      const isVerified = row.original.emailVerified;

      return (
        <div className='flex flex-row items-center gap-1.5 text-sm'>
          <p>{row.original.email}</p>
          {isVerified || <BadgeCheck className="h-4 w-4 text-primary" />}
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader title='Role' column={column} />
    ),
    cell: ({ row }) => {
      return <UserRoleBadge role={row.original.role} />;
    },
  },
];
