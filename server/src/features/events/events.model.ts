import db from '@/db';
import { event as eventTable } from '@/db/schema';
import { StatusConfig } from '@auxilium/configs/status';
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
