import db from '@/db';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusConfig } from '@auxilium/configs/status';
import { APIError } from '@auxilium/types/errors';
import { and, eq } from 'drizzle-orm';
import * as schema from '@/db/schema';
import {
  event as eventTable,
  eventReport as eventReportTable,
  eventParticipation as eventParticipationTable,
} from '@/db/schema';
import type {
  CreateEventDTO,
  UpdateEventDTO,
  GetAllEventsQueryDTO,
  CreateEventReportDTO,
  CreateEventParticipationDTO,
  GetParticipationRecordsQueryDTO,
  AssignUserToEventDTO,
  UnassignUserFromEventDTO,
} from './events.dto';
import { RolesConfig } from '@auxilium/configs/roles';

@Injectable()
export class EventsService {
  async getEventById({ eventId }: { eventId: string }) {
    const event = await db.query.event.findFirst({
      where: {
        eventId,
      },
      with: {
        eventType: true,
        creator: true,
        eventReport: true,
        userEventRoles: {
          with: {
            eventRole: true,
            user: {
              columns: {
                name: true,
                email: true,
                image: true,
              },
              with: {
                userProfile: true,
              },
            },
          },
        },
      },
    });

    return event;
  }

  async createEvent(args: CreateEventDTO & { createdBy: string }) {
    const {
      name,
      eventTypeId,
      description,
      createdBy,
      startDate,
      endDate,
      ...rest
    } = args;

    if (!name || !eventTypeId || !description) {
      throw new APIError(
        'Missing required fields: name, eventTypeId, description',
        400,
      );
    }

    if (!createdBy) {
      throw new APIError('Unauthorized; missing user information', 401);
    }

    const [newEvent] = await db
      .insert(eventTable)
      .values({
        name,
        eventTypeId,
        description,
        createdBy,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        ...rest,
      })
      .returning();

    return newEvent;
  }

  async getAllEvents(args: GetAllEventsQueryDTO) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      eventTypeId,
      statusId = StatusConfig.ACTIVE,
      day,
      month,
      year,
    } = args;

    // Build date range for filtering
    let dateStart: Date | undefined;
    let dateEnd: Date | undefined;

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
    if (statusId !== undefined) {
      andConditions.push({ statusId: { eq: statusId } });
    }
    if (dateStart && dateEnd) {
      andConditions.push({
        startDate: { gte: dateStart, lt: dateEnd },
      });
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
        [sortBy]: sortOrder,
      },
    });

    return events;
  }

  async updateEvent(args: UpdateEventDTO) {
    const { eventId, startDate, endDate, ...updateData } = args;

    const [updatedEvent] = await db
      .update(eventTable)
      .set({
        ...updateData,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      })
      .where(eq(eventTable.eventId, eventId))
      .returning();

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return updatedEvent;
  }

  async deleteEvent({ eventId }: { eventId: string }) {
    const [deletedEvent] = await db
      .update(eventTable)
      .set({
        statusId: StatusConfig.DELETED,
      })
      .where(eq(eventTable.eventId, eventId))
      .returning();

    if (!deletedEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return deletedEvent;
  }

  async restoreEvent({ eventId }: { eventId: string }) {
    const [restoredEvent] = await db
      .update(eventTable)
      .set({
        statusId: StatusConfig.ACTIVE,
      })
      .where(eq(eventTable.eventId, eventId))
      .returning();

    if (!restoredEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return restoredEvent;
  }

  async hardDeleteEvent({ eventId }: { eventId: string }) {
    const deletedEvent = await db
      .delete(eventTable)
      .where(eq(eventTable.eventId, eventId))
      .returning();

    if (deletedEvent.length === 0) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return deletedEvent;
  }

  // Event Reports
  async createEventReport(args: CreateEventReportDTO & { createdBy: string }) {
    const { eventId, createdBy, ...rest } = args;

    const eventReport = await db.transaction(async (tx) => {
      const existingReport = await tx.query.eventReport.findFirst({
        where: {
          eventId,
        },
      });

      // Check if a report already exists
      if (existingReport) {
        // Clear out existing participation records if report already exists
        await tx
          .delete(eventParticipationTable)
          .where(
            eq(
              eventParticipationTable.eventReportId,
              existingReport.eventReportId,
            ),
          );
      }

      // Create the report (this will upsert if it already exists)
      const [eventReport] = await tx
        .insert(eventReportTable)
        .values({
          eventId,
          createdBy,
          ...rest,
        })
        .onConflictDoUpdate({
          target: eventReportTable.eventId,
          set: {
            createdBy,
            ...rest,
          },
        })
        .returning();

      return eventReport;
    });

    if (!eventReport) {
      throw new APIError('Failed to create event report', 500);
    }

    return eventReport;
  }

  // async getEventReportsByEventId({ eventId }: { eventId: string }) {
  //   const eventReports = await db.query.eventReport.findMany({
  //     where: {
  //       eventId,
  //     },
  //   });

  //   return eventReports;
  // }

  async getEventReportById({ eventReportId }: { eventReportId: string }) {
    const eventReport = await db.query.eventReport.findFirst({
      where: {
        eventReportId,
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

    if (!eventReport) {
      throw new NotFoundException(
        `Event report with ID ${eventReportId} not found`,
      );
    }

    return eventReport;
  }

  // TODO: Allow users to delete reports

  // Event Participation
  async createEventParticipationRecord(args: CreateEventParticipationDTO) {
    const [inserted] = await db
      .insert(eventParticipationTable)
      .values(args)
      .returning();

    if (!inserted) {
      throw new APIError('Failed to insert event participation record', 500);
    }

    // Fetch the full record with the eventRole
    const participationRecord = await db.query.eventParticipation.findFirst({
      where: {
        participationId: inserted.participationId,
      },
      with: {
        eventRole: true,
      },
    });

    return participationRecord;
  }

  async getParticipationRecordsByReportId(
    args: GetParticipationRecordsQueryDTO,
  ) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      eventReportId,
      statusId,
    } = args;

    // TODO: Add search filtering here

    const count = await db.$count(
      eventParticipationTable,
      eq(eventParticipationTable.eventReportId, eventReportId),
    );

    const participations = await db.query.eventParticipation.findMany({
      where: {
        eventReportId,
      },
      with: {
        eventRole: true,
        userProfile: true,
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      pageCount: Math.ceil(count / pageSize),
      participations,
    };
  }

  async createUserEventRole(args: AssignUserToEventDTO) {
    // Check if the user is an administrator
    const userRole = await db.query.userRole.findFirst({
      where: {
        userId: args.userId,
      },
    });

    if (!userRole) {
      throw new BadRequestException(
        `User with ID ${args.userId} does not exist.`,
      );
    } else if (
      userRole.roleId !== RolesConfig.ADMIN &&
      userRole.roleId !== RolesConfig.SUPERADMIN
    ) {
      throw new BadRequestException(
        'Only administrators can be assigned event roles.',
      );
    }

    const selectedEventRole = await db.query.eventRole.findFirst({
      where: {
        eventRoleId: args.eventRoleId,
      },
    });

    // Ensure user has a valid event role that is not a participation-only role
    if (
      !selectedEventRole ||
      selectedEventRole.pointsType === 'PARTICIPATION'
    ) {
      throw new BadRequestException(
        `Invalid Event role ID ${args.eventRoleId} provided. Event role has to exist and cannot be a participation-only role.`,
      );
    }

    const [createdRole] = await db
      .insert(schema.userEventRole)
      .values({
        eventId: args.eventId,
        userId: args.userId,
        eventRoleId: args.eventRoleId,
      })
      .onConflictDoUpdate({
        target: [schema.userEventRole.eventId, schema.userEventRole.userId],
        set: {
          eventRoleId: args.eventRoleId,
        },
      })
      .returning();

    return createdRole;
  }

  async deleteUserEventRole(args: UnassignUserFromEventDTO) {
    const deleted = await db
      .delete(schema.userEventRole)
      .where(
        and(
          eq(schema.userEventRole.eventId, args.eventId),
          eq(schema.userEventRole.userId, args.userId),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      throw new NotFoundException(
        `User ${args.userId} not assigned to event ${args.eventId}`,
      );
    }

    return deleted[0];
  }

  // Event Types
  async getAllEventTypes() {
    const eventTypes = await db.query.eventType.findMany();
    return eventTypes;
  }

  // Event Roles
  async getAllEventRoles() {
    const eventRoles = await db.query.eventRole.findMany();
    return eventRoles;
  }

  async getUserEventRole(args: { userId: string; eventId: string }) {
    const userEventRole = await db.query.userEventRole.findFirst({
      where: {
        ...args,
      },
    });

    return userEventRole;
  }
}
