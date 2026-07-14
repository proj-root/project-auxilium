import type { ColumnDef } from '@tanstack/react-table';
import type { UserProfileDTO } from '../../user.dto';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Link } from 'react-router';

export const columns: ColumnDef<UserProfileDTO>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.firstName + ' ' + row.lastName,
    header: ({ column }) => (
      <DataTableColumnHeader title='Name' column={column} />
    ),
    cell: ({ row }) => {
      return (
        <Link to={`/admin/users/${row.original.profileId}`} className='hover:underline'>
          {row.original.firstName + ' ' + row.original.lastName}
        </Link>
      );
    },
  },
  {
    id: 'adminNumber',
    accessorFn: (row) => row.adminNumber,
    header: ({ column }) => (
      <DataTableColumnHeader title='Admin Number' column={column} />
    ),
  },
  {
    id: 'course',
    accessorFn: (row) => row.course,
    header: ({ column }) => (
      <DataTableColumnHeader title='Course' column={column} />
    ),
  },
  {
    id: 'class',
    accessorFn: (row) => row.studentClass,
    header: ({ column }) => (
      <DataTableColumnHeader title='Class' column={column} />
    ),
  },
  {
    id: 'email',
    accessorFn: (row) => row.ichat.toLowerCase(),
    header: ({ column }) => (
      <DataTableColumnHeader title='Email (iChat)' column={column} />
    ),
  },
];
