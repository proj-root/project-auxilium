import { type ColumnDef } from '@tanstack/react-table';
import type { EventParticipation } from '../events.dto';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

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
    accessorFn: (row) =>
      `${row.userProfile.firstName} ${row.userProfile.lastName}`,
    header: ({ column }) => <DataTableColumnHeader title='Full Name' column={column} />
  },
  {
    id: 'adminNumber',
    accessorFn: (row) =>
      `${row.userProfile.adminNumber}`,
    header: ({ column }) => <DataTableColumnHeader title='Admin No.' column={column} />
  },
  {
    id: 'eventRole',
    accessorFn: (row) =>
      `${row.eventRole}`,
    header: ({ column }) => <DataTableColumnHeader title='Role' column={column} />
  },
  {
    id: 'pointsType',
    accessorFn: (row) =>
      `${row.pointsType}`,
    header: ({ column }) => <DataTableColumnHeader title='Points Type' column={column} />
  },
  {
    id: 'class',
    accessorFn: (row) =>
      `${row.userProfile.studentClass}`,
    header: ({ column }) => <DataTableColumnHeader title='Class' column={column} />
  },
  {
    id: 'ichat',
    accessorFn: (row) =>
      `${row.userProfile.ichat}`,
    header: ({ column }) => <DataTableColumnHeader title='iChat Email' column={column} />
  },
];
