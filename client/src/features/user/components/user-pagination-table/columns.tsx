import type { ColumnDef } from '@tanstack/react-table';
import type { UserDTO } from '../../user.dto';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { BadgeCheck, Edit2, User } from 'lucide-react';
import { UserRoleBadge } from '../role-badge';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SelectUserRole } from './cell-helpers';
import { RolesConfig } from '@auxilium/configs/roles';

export const columns: ColumnDef<UserDTO>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader title='Name' column={column} />
    ),
    cell: ({ row }) => {
      const userProfile = row.original.userProfile ?? null;

      if (!userProfile) {
        return <span title='No profile linked'>{row.original.name}</span>;
      }

      return (
        <Link
          to={`/admin/users/${userProfile.profileId}`}
          className='hover:underline'
        >
          {row.original.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'adminNumber',
    header: ({ column }) => (
      <DataTableColumnHeader title='Admin Number' column={column} />
    ),
    cell: ({ row }) => {
      const userProfile = row.original.userProfile ?? null;

      if (!userProfile) {
        return <span title='No profile linked'>-</span>;
      }

      return <span>{userProfile.adminNumber}</span>;
    },
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
          <p>{row.original.email.toLowerCase()}</p>
          {isVerified && <BadgeCheck className='text-primary h-4 w-4' />}
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
      if (row.original.role.roleId === RolesConfig.SUPERADMIN) {
        return <UserRoleBadge role={row.original.role} />;
      }
      
      return (
        <SelectUserRole
          userId={row.original.id}
          currentRole={row.original.role}
        />
      );
    },
  },
  {
    accessorKey: 'departments',
    header: ({ column }) => (
      <DataTableColumnHeader title='Departments' column={column} />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex flex-wrap gap-1'>
          {row.original.departments.map((dept) => (
            <Badge key={dept.departmentId} variant='secondary'>
              {dept.name}
            </Badge>
          ))}
          {row.original.departments.length === 0 && (
            <Badge variant='outline'>NA</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader title='Created At' column={column} />
    ),
    cell: ({ row }) => {
      return <p>{format(row.original.createdAt, 'PPP hh:mm a')}</p>;
    },
  },
];
