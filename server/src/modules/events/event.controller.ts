import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Logger,
  NotFoundException,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  BadRequestException,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './event.service';
import { VerificationEngineService } from './lib/verification-engine.service';
import { SheetsService } from './lib/sheets.service';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import type { Request } from 'express';
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
import {
  CreateEventSchema,
  UpdateEventSchema,
  CreateEventReportSchema,
  CreateEventParticipationSchema,
  AssignUserToEventSchema,
  UnassignUserFromEventSchema,
} from './events.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { EventRolesConfig, SystemConfig } from '@/config/system.config';
import { RoleGuard } from '@/common/guards/role.guard';
import { RolesConfig } from '@auxilium/configs/roles';
import { Roles } from '@/common/decorators/roles.decorator';
import { EventRoleGuard } from '@/common/guards/event-role.guard';
import { EventRoles } from '@/common/decorators/event-roles.decorator';

const ROUTE_NAME = 'api/events';

@Controller(ROUTE_NAME)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  private readonly tempSheetId = SystemConfig.tempSheetId;

  constructor(
    private readonly eventsService: EventsService,
    private readonly verificationEngine: VerificationEngineService,
    private readonly sheetsService: SheetsService,
  ) {}

  /**
   * GET /api/events
   * Retrieve all events with pagination and filtering
   */
  @Get()
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getAllEvents(@Query() query: Partial<GetAllEventsQueryDTO>) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      eventTypeId,
      statusId,
      day,
      month,
      year,
    } = query;

    const result = await this.eventsService.getAllEvents({
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy:
        (sortBy as 'name' | 'startDate' | 'endDate' | 'createdAt') ||
        'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      search: search as string,
      eventTypeId: eventTypeId ? Number(eventTypeId) : undefined,
      statusId: statusId ? Number(statusId) : undefined,
      day: day ? Number(day) : undefined,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    });

    this.logger.verbose(`Retrieved ${result.events.length} events sucessfully.`);

    return {
      status: 'success',
      message: 'Events retrieved successfully',
      data: result,
    };
  }

  /**
   * POST /api/events
   * Create a new event
   */
  @Post()
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  @HttpCode(201)
  async createEvent(
    @Body(new ZodValidationPipe(CreateEventSchema))
    createEventDto: CreateEventDTO,
    @Session() session: UserSession,
  ) {
    // Extract user ID from better-auth session
    const userId = session.user.id;

    const newEvent = await this.eventsService.createEvent({
      ...createEventDto,
      createdBy: userId,
    });

    return {
      status: 'success',
      message: 'Event created successfully',
      data: newEvent,
    };
  }

  /**
   * GET /api/events/types
   * Get all event types
   */
  @Get('types')
  async getAllEventTypes() {
    const eventTypes = await this.eventsService.getAllEventTypes();

    return {
      status: 'success',
      message: 'Event types retrieved successfully',
      data: eventTypes,
    };
  }

  /**
   * GET /api/events/roles
   * Get all event roles
   */
  @Get('roles')
  async getAllEventRoles() {
    const eventRoles = await this.eventsService.getAllEventRoles();

    return {
      status: 'success',
      message: 'Event roles retrieved successfully',
      data: eventRoles,
    };
  }

  /**
   * GET /api/events/reports/:reportId/participants
   * Get participation records for an event report
   */
  @Get('reports/:reportId/participants')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getParticipationRecords(
    @Param('reportId') reportId: string,
    @Query() query: Partial<GetParticipationRecordsQueryDTO>,
  ) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      statusId,
    } = query;
    console.log('Fetching participation records with query:', query);

    const result = await this.eventsService.getParticipationRecordsByReportId({
      eventReportId: reportId,
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy: (sortBy as 'name' | 'createdAt') || 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      search: search as string,
      statusId: statusId ? Number(statusId) : undefined,
    });

    return {
      status: 'success',
      message: 'Participation records retrieved successfully',
      data: result,
    };
  }

  /**
   * GET /api/events/reports/:reportId
   * Get a single event report
   */
  @Get('reports/:reportId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getEventReportById(@Param('reportId') reportId: string) {
    const eventReport = await this.eventsService.getEventReportById({
      eventReportId: reportId,
    });

    return {
      status: 'success',
      message: 'Event report retrieved successfully',
      data: eventReport,
    };
  }

  /**
   * POST /api/events/reports/:reportId/participants
   * Create a participation record
   */
  // @Post('reports/:reportId/participants')
  // @HttpCode(201)
  // @UsePipes(new ZodValidationPipe(CreateEventParticipationSchema))
  // async createParticipationRecord(
  //   @Param('reportId') reportId: string,
  //   @Body() participationDto: Partial<CreateEventParticipationDTO>,
  // ) {
  //   const participationRecord =
  //     await this.eventsService.createEventParticipationRecord({
  //       eventReportId: reportId,
  //       ...participationDto,
  //     } as CreateEventParticipationDTO);

  //   return {
  //     status: 'success',
  //     message: 'Participation record created successfully',
  //     data: participationRecord,
  //   };
  // }

  /**
   * GET /api/events/:id
   * Retrieve a single event by ID
   */
  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getEventById(@Param('id') eventId: string) {
    const event = await this.eventsService.getEventById({ eventId });

    if (!event)
      throw new NotFoundException(`Event with ID ${eventId} not found`);

    return {
      status: 'success',
      message: 'Event retrieved successfully',
      data: event,
    };
  }

  /**
   * PUT /api/events/:id
   * Update an event
   */
  @Put(':id')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async updateEvent(
    @Param('id') eventId: string,
    @Body(new ZodValidationPipe(UpdateEventSchema))
    body: Partial<CreateEventDTO>,
  ) {
    const cleanedData = Object.fromEntries(
      Object.entries(body)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => {
          if (value === '') return [key, null];
          return [key, value];
        }),
    );

    this.logger.debug(cleanedData)

    const updatedEvent = await this.eventsService.updateEvent({
      eventId,
      ...cleanedData,
    });

    // TODO: Add updated by who

    return {
      status: 'success',
      message: 'Event updated successfully',
      data: updatedEvent,
    };
  }

  /**
   * POST /api/events/:id/generate
   * Generate points sheet by verifying participants across signup, feedback, and helper sheets
   */
  @Post(':id/generate')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  @HttpCode(201)
  async generatePointsSheet(
    @Param('id') eventId: string,
    @Session() session: UserSession,
  ) {
    // Fetch event to get the spreadsheet URLs
    const event = await this.eventsService.getEventById({ eventId });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const { signupUrl, feedbackUrl } = event;
    if (!signupUrl || !feedbackUrl) {
      throw new BadRequestException(
        'Missing form URLs. Please ensure signupUrl and feedbackUrl are all updated.',
      );
    }

    if (!this.tempSheetId) {
      throw new BadRequestException(
        'tempSheetId is required to store the generated points',
      );
    }

    // Verify participants and get points data
    const verificationResult = await this.verificationEngine.verifyParticipants(
      {
        eventId,
        userId: session.user.id,
        signupUrl,
        feedbackUrl,
      },
    );

    // Clear the existing data in the temporary sheet before inserting new data
    await this.sheetsService.clearSheet({
      spreadsheetId: this.tempSheetId,
      range: 'A2:G',
    });

    // Insert the points data into the temporary sheet
    await this.sheetsService.insertIntoSheet({
      spreadsheetId: this.tempSheetId,
      range: 'A2:G',
      values: verificationResult.participants,
    });

    return {
      status: 'success',
      message: 'Points sheet generated successfully',
      data: {
        ...verificationResult,
      },
    };
  }

  /**
   * POST /api/events/:id/restore
   * Restore a soft-deleted event
   */
  @Post(':id/restore')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async restoreEvent(@Param('id') eventId: string) {
    const restoredEvent = await this.eventsService.restoreEvent({ eventId });

    return {
      status: 'success',
      message: 'Event restored successfully',
      data: restoredEvent,
    };
  }

  /**
   * GET /api/events/:eventId/reports
   * Get all reports for an event
   */
  // @Get(':eventId/reports')
  // async getEventReportsByEventId(@Param('eventId') eventId: string) {
  //   const eventReports = await this.eventsService.getEventReportsByEventId({
  //     eventId,
  //   });

  //   return {
  //     status: 'success',
  //     message: 'Event reports retrieved successfully',
  //     data: eventReports,
  //   };
  // }

  /**
   * DELETE /api/events/:id/hard
   * Permanently delete an event
   */
  @Delete(':id/hard')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async hardDeleteEvent(@Param('id') eventId: string) {
    await this.eventsService.hardDeleteEvent({ eventId });

    return {
      status: 'success',
      message: 'Event permanently deleted successfully',
    };
  }

  /**
   * DELETE /api/events/:id
   * Soft delete an event (mark as deleted)
   */
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async deleteEvent(@Param('id') eventId: string) {
    await this.eventsService.deleteEvent({ eventId });

    return {
      status: 'success',
      message: 'Event deleted successfully',
    };
  }

  @Post(':id/assign')
  @UseGuards(RoleGuard, EventRoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  @EventRoles({ paramKey: ':id', roles: [EventRolesConfig.COORDINATOR] })
  async assignUserToEvent(
    @Param('id') eventId: string,
    @Body(new ZodValidationPipe(AssignUserToEventSchema))
    body: Partial<AssignUserToEventDTO>,
  ) {
    await this.eventsService.createUserEventRole({
      eventId,
      ...body,
    } as AssignUserToEventDTO);

    return {
      status: 'success',
      message: 'User assigned to event successfully',
    };
  }

  @Delete(':id/assign')
  @UseGuards(RoleGuard, EventRoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  @EventRoles({ paramKey: ':id', roles: [EventRolesConfig.COORDINATOR] })
  async unassignUserFromEvent(
    @Param('id') eventId: string,
    @Body(new ZodValidationPipe(UnassignUserFromEventSchema))
    body: Partial<UnassignUserFromEventDTO>,
  ) {
    await this.eventsService.deleteUserEventRole({
      eventId,
      ...body,
    } as UnassignUserFromEventDTO);

    return {
      status: 'success',
      message: 'User unassigned from event successfully',
    };
  }
}
