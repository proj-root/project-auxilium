import db from '@/db';
import {
  eventReport as eventReportTable,
  eventRole,
  eventParticipation as eventParticipationTable,
  event as eventTable,
  eventPointsType,
} from '@/db/schema';
import { StatusConfig } from '@auxilium/configs/status';
import type { PaginationOptions } from '@auxilium/types/pagination';
import { APIError } from '@auxilium/types/errors';
import { eq, ilike, or } from 'drizzle-orm';

interface CreateEventArgs {
  name: string;
  eventTypeId: number;
  description: string;
  startDate?: Date;
  endDate?: Date;
  platform?: string;
  signupUrl?: string;
  feedbackUrl?: string;
  helpersUrl?: string;
  createdBy: string;
}

export const createEvent = async (args: CreateEventArgs) => {
  const [newEvent] = await db
    .insert(eventTable)
    .values({
      ...args,
    })
    .returning();

  return newEvent;
};

export const getEventById = async ({ eventId }: { eventId: string }) => {
  const event = await db.query.event.findFirst({
    where: eq(eventTable.eventId, eventId),
    with: {
      eventType: true,
      creator: {
        columns: {
          password: false,
        },
      },
      eventReports: {
        orderBy: (eventReports, { desc }) => desc(eventReports.createdAt),
        limit: 25,
      },
    },
  });

  return event;
};

interface GetPaginatedEventsArgs extends PaginationOptions {
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt';
  eventTypeId?: number;
  statusId?: number;
}

export const getAllEvents = async ({
  page = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  search,
  eventTypeId = undefined,
  statusId = StatusConfig.ACTIVE,
}: GetPaginatedEventsArgs) => {
  const events = await db.query.event.findMany({
    where: or(
      search && search.trim() !== ''
        ? ilike(eventTable.name, `%${search.trim()}%`)
        : undefined,
      eventTypeId ? eq(eventTable.eventTypeId, eventTypeId) : undefined,
      statusId ? eq(eventTable.statusId, statusId) : undefined,
    ),
    with: {
      eventType: true,
      creator: {
        columns: {
          password: false,
        },
      },
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: (events, { desc, asc }) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? asc(events.name) : desc(events.name);
      } else if (sortBy === 'startDate') {
        return sortOrder === 'asc'
          ? asc(events.startDate)
          : desc(events.startDate);
      } else if (sortBy === 'endDate') {
        return sortOrder === 'asc' ? asc(events.endDate) : desc(events.endDate);
      } else {
        return sortOrder === 'asc'
          ? asc(events.createdAt)
          : desc(events.createdAt);
      }
    },
  });

  return events;
};

interface UpdateEventArgs {
  eventId: string;
  name?: string;
  eventTypeId?: number;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  platform?: string;
  signupUrl?: string;
  feedbackUrl?: string;
  helpersUrl?: string;
}

export const updateEventById = async (args: UpdateEventArgs) => {
  const [updatedEvent] = await db
    .update(eventTable)
    .set({
      ...args,
    })
    .where(eq(eventTable.eventId, args.eventId))
    .returning();

  return updatedEvent;
};

export const deleteEventById = async ({ eventId }: { eventId: string }) => {
  const [deletedEvent] = await db
    .update(eventTable)
    .set({
      statusId: StatusConfig.DELETED,
    })
    .where(eq(eventTable.eventId, eventId))
    .returning();

  return deletedEvent;
};

export const restoreEventById = async ({ eventId }: { eventId: string }) => {
  const [restoredEvent] = await db
    .update(eventTable)
    .set({
      statusId: StatusConfig.ACTIVE,
    })
    .where(eq(eventTable.eventId, eventId))
    .returning();

  return restoredEvent;
};

export const hardDeleteEventById = async ({ eventId }: { eventId: string }) => {
  const deletedEvent = await db
    .delete(eventTable)
    .where(eq(eventTable.eventId, eventId))
    .returning();

  return deletedEvent;
};

// Event Reports
interface CreateEventReportArgs {
  eventId: string;
  signupCount: number;
  feedbackCount: number;
  createdBy: string;
}

// TODO: Store more statistical data here
export const createEventReport = async (args: CreateEventReportArgs) => {
  const [eventReport] = await db
    .insert(eventReportTable)
    .values({
      ...args,
    })
    .returning();

  if (!eventReport) {
    throw new APIError('Failed to create event report', 500);
  }

  return eventReport;
};

// Get all generated reports under an event
export const getEventReportsByEventId = async ({
  eventId,
}: {
  eventId: string;
}) => {
  const eventReports = await db.query.eventReport.findMany({
    where: eq(eventReportTable.eventId, eventId),
  });

  return eventReports;
};

// Get a single generated report by its ID
export const getEventReportById = async ({
  eventReportId,
}: {
  eventReportId: string;
}) => {
  const eventReport = await db.query.eventReport.findFirst({
    where: eq(eventReportTable.eventReportId, eventReportId),
    with: {
      eventParticipations: {
        with: {
          userProfile: true,
        },
      },
      creator: {
        columns: {
          password: false,
        }
      },
    },
  });

  return eventReport;
};

interface CreateEventParticipationRecordArgs {
  profileId: string;
  eventReportId: string;
  attended?: boolean;
  eventRole?: (typeof eventRole.enumValues)[number];
  pointsType?: (typeof eventPointsType.enumValues)[number];
  pointsAwarded?: number;
}

export const createEventParticipationRecord = async (
  args: CreateEventParticipationRecordArgs,
) => {
  const [participationRecord] = await db
    .insert(eventParticipationTable)
    .values({
      ...args,
    })
    .returning();

  if (!participationRecord) {
    throw new APIError('Failed to insert event participation record', 500);
  }

  return participationRecord;
};

export const getAllEventTypes = async () => {
  const eventTypes = await db.query.eventType.findMany();
  return eventTypes;
};
