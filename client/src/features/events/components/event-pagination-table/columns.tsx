import type { ColumnDef } from '@tanstack/react-table';
import type { Event } from '../../events.dto';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';

export const columns: ColumnDef<Omit<Event, 'eventReport'>>[] = [
  // Put checkbox here next time for bulk actions
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader title='Name' column={column} />
    ),
    cell: ({ row }) => {
      return (
        <Link
          to={`/admin/events/${row.original.eventId}`}
          className='hover:underline'
        >
          {row.original.name}
        </Link>
      );
    },
  },
  {
    id: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader title='Date' column={column} />
    ),
    cell: ({ row }) => {
      const { startDate, endDate } = row.original;
      if (!startDate || !endDate) {
        return <p className='text-muted-foreground'>-</p>;
      }
      if (startDate && endDate && isSameDay(startDate, endDate)) {
        return (
          <div>
            <p>{format(startDate, 'PPP')}</p>
            <p className='text-muted-foreground text-xs'>
              {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
            </p>
          </div>
        );
      }
      return (
        <p>
          {format(startDate, 'PPP')} - {format(endDate, 'PPP')}
        </p>
      );
    },
  },
  // TODO: Show task progress here
  {
    id: 'eventType',
    header: ({ column }) => (
      <DataTableColumnHeader title='Event Type' column={column} />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.eventType ? 'secondary' : 'outline'}
          className={cn(
            '',
            !row.original.eventType &&
              'text-muted-foreground outline-1 outline-dashed',
          )}
        >
          {row.original.eventType.name ?? 'NA'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'platform',
    header: ({ column }) => (
      <DataTableColumnHeader title='Platform' column={column} />
    ),
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.platform ? 'secondary' : 'outline'}
          className={cn(
            '',
            !row.original.platform &&
              'text-muted-foreground outline-1 outline-dashed',
          )}
        >
          {row.original.platform ?? 'NA'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'venue',
    header: ({ column }) => (
      <DataTableColumnHeader title='Venue' column={column} />
    ),
    cell: ({ row }) => {
      return <p>{row.original.venue ?? '-'}</p>;
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
