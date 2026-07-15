import { type ColumnDef } from '@tanstack/react-table';
import type { EventParticipation } from '../events.dto';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Link } from 'react-router';
import { authClient } from '@/lib/auth-client';
import { RolesConfig } from '@auxilium/configs/roles';

export const columns: ColumnDef<EventParticipation>[] = [
  // {
  //   accessorKey: 'participationId',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader title='ID' column={column} />
  //   ),
  //   cell: ({ row }) => row.original.participationId,
  // },
  {
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader title='Full Name' column={column} />
    ),
    cell: ({ row }) => {
      const { data } = authClient.useSession();

      // @ts-expect-error - role is a custom attribute
      if (data?.user.role.roleId !== RolesConfig.SUPERADMIN) {
        return (
          <p>
            {row.original.userProfile.firstName}{' '}
            {row.original.userProfile.lastName}
          </p>
        );
      }

      return (
        <Link
          to={`/admin/users/${row.original.profileId}`}
          className='hover:underline'
        >
          {row.original.userProfile.firstName}{' '}
          {row.original.userProfile.lastName}
        </Link>
      );
    },
  },
  {
    id: 'adminNumber',
    accessorFn: (row) => `${row.userProfile.adminNumber}`,
    header: ({ column }) => (
      <DataTableColumnHeader title='Admin No.' column={column} />
    ),
  },
  {
    id: 'eventRole',
    accessorFn: (row) => `${row.eventRole.name}`,
    header: ({ column }) => (
      <DataTableColumnHeader title='Role' column={column} />
    ),
  },
  {
    id: 'pointsType',
    accessorFn: (row) => `${row.eventRole.pointsType}`,
    header: ({ column }) => (
      <DataTableColumnHeader title='Points Type' column={column} />
    ),
  },
  {
    id: 'class',
    accessorFn: (row) => `${row.userProfile.studentClass}`,
    header: ({ column }) => (
      <DataTableColumnHeader title='Class' column={column} />
    ),
  },
  {
    id: 'ichat',
    accessorFn: (row) => `${row.userProfile.ichat}`,
    header: ({ column }) => (
      <DataTableColumnHeader title='iChat Email' column={column} />
    ),
  },
];
