import db from '@/db';
import {
  eventReport as eventReportTable,
  eventRole,
  eventParticipation as eventParticipationTable,
  event as eventTable,
} from '@/db/schema';
import { StatusConfig } from '@auxilium/configs/status';
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
    where: eq(eventTable.eventId, eventId),
    with: {
      eventType: true,
      creator: true,
      eventReports: true,
    },
  });

  return event;
};

// TODO: Add pagination and filtering
export const getAllEvents = async () => {
  const events = await db.query.event.findMany({
    with: {
      eventType: true,
      creator: true,
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
export const getEventReportsByEventId = async ({ eventId }: { eventId: string }) => {
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
      eventParticipations: true,
      creator: true,
    }
  });

  return eventReport;
};

interface CreateEventParticipationRecordArgs {
  profileId: string;
  eventReportId: string;
  attended?: boolean;
  eventRole?: (typeof eventRole.enumValues)[number];
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
};
