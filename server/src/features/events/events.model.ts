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
import { eq } from 'drizzle-orm';

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
    where: {
      eventId,
    },
    with: {
      eventType: true,
      creator: true,
      eventReports: {
        orderBy: {
          createdAt: 'desc',
        },
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
  day?: number;
  month?: number;
  year?: number;
}

export const getAllEvents = async ({
  page = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  search,
  eventTypeId = undefined,
  statusId = StatusConfig.ACTIVE,
  day,
  month,
  year,
}: GetPaginatedEventsArgs) => {
  // Build date range for filtering
  let dateStart: Date | undefined = undefined;
  let dateEnd: Date | undefined = undefined;
  if (year && month && day) {
    // Specific day
    dateStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    dateEnd = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
  } else if (year && month) {
    // Whole month
    dateStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    dateEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  } else if (year) {
    // Whole year
    dateStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    dateEnd = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));
  }

  // Build AND conditions for all filters
  const andConditions: object[] = [];
  if (search && search.trim() !== '') {
    andConditions.push({ name: { ilike: `%${search.trim()}%` } });
  }
  if (eventTypeId) {
    andConditions.push({ eventTypeId: { eq: eventTypeId } });
  }
  if (statusId) {
    andConditions.push({ statusId: { eq: statusId } });
  }
  if (dateStart && dateEnd) {
    andConditions.push({ startDate: { gte: dateStart, lt: dateEnd } });
  }

  const events = await db.query.event.findMany({
    where: andConditions.length > 0 ? { AND: andConditions } : undefined,
    with: {
      eventType: true,
      creator: true,
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: {
      [sortBy]: sortOrder
    }
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
    where: {
      eventId
    }
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
    where: {
      eventReportId
    },
    with: {
      eventParticipations: {
        with: {
          userProfile: true,
        },
      },
      creator: true,
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

interface GetParticipationRecordsByReportIdArgs extends PaginationOptions {
  eventReportId: string;
  sortBy?: 'name' | 'createdAt';
  statusId?: number;
}

export const getParticipationRecordsByReportId = async ({
  page = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  search,
  eventReportId,
  statusId = StatusConfig.ACTIVE,
}: GetParticipationRecordsByReportIdArgs) => {
  const count = await db.$count(
    eventParticipationTable,
    eq(eventParticipationTable.eventReportId, eventReportId),
  );

  const participations = await db.query.eventParticipation.findMany({
    where: {
      eventReportId
    },
    with: {
      userProfile: true,
    },
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: {
      [sortBy]: sortOrder,
    }
  });

  return {
    pageCount: Math.ceil(count / pageSize),
    participations,
  };
};

export const getAllEventTypes = async () => {
  const eventTypes = await db.query.eventType.findMany();
  return eventTypes;
};
