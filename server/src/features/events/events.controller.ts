import type { Request, Response } from 'express';
import { accessSheets } from './lib/access-sheets';
import { verifyParticipants } from './lib/verification-engine';
import { BaseResponseDTO } from '@auxilium/types/response';
import { catchAsync } from '@/lib/catch-async';
import * as EventModel from './events.model';
import { APIError } from '@auxilium/types/errors';
import { logger } from '@/lib/logger';

export const createEvent = catchAsync(async (req: Request, res: Response) => {
  let {
    name,
    eventTypeId,
    description,
    startDate,
    endDate,
    platform,
    signupUrl,
    feedbackUrl,
    helpersUrl,
  } = req.body;

  const createdBy = res.locals.user.userId;
  if (!name || !eventTypeId || !description) {
    throw new APIError(
      'Missing required fields: name, eventTypeId, description',
      400,
    );
  }
  if (!createdBy) {
    throw new APIError('Unauthorized; missing user information', 401);
  }

  const newEvent = await EventModel.createEvent({
    name,
    eventTypeId,
    description,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    platform,
    signupUrl,
    feedbackUrl,
    helpersUrl,
    createdBy,
  });

  res.status(201).json({
    status: 'success',
    message: 'Event created successfully',
    data: {
      event: newEvent,
    },
  });
});

export const getEventById = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const event = await EventModel.getEventById({ eventId: eventId as string });

  if (!event) {
    throw new APIError('Event not found', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Event retrieved successfully',
    data: {
      ...event,
    },
  });
});

export const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const events = await EventModel.getAllEvents();

  res.status(200).json({
    status: 'success',
    message: 'Events retrieved successfully',
    data: {
      events,
    },
  });
});

export const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const {
    name,
    eventTypeId,
    description,
    startDate,
    endDate,
    platform,
    signupUrl,
    feedbackUrl,
    helpersUrl,
  } = req.body;

  await EventModel.updateEventById({
    eventId: eventId as string,
    name,
    eventTypeId,
    description,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    platform,
    signupUrl,
    feedbackUrl,
    helpersUrl,
  });

  res.status(200).json({
    status: 'success',
    message: 'Event updated successfully',
  });
});

export const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  await EventModel.deleteEventById({ eventId: eventId as string });

  res.status(200).json({
    status: 'success',
    message: 'Event deleted successfully',
  });
});

export const hardDeleteEvent = catchAsync(
  async (req: Request, res: Response) => {
    const { eventId } = req.params;
    await EventModel.hardDeleteEventById({ eventId: eventId as string });

    res.status(200).json({
      status: 'success',
      message: 'Event permanently deleted successfully',
    });
  },
);

export const generatePointsSheet = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  // Assume URL format is https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit
  const event = await EventModel.getEventById({ eventId: eventId as string });
  if (!event) {
    throw new APIError('Event not found', 404);
  }

  const { signupUrl, feedbackUrl, helpersUrl } = event;
  if (!signupUrl || !feedbackUrl || !helpersUrl) {
    throw new APIError(
      'Missing form URLs. Please ensure signupUrl, feedbackUrl, and helpersUrl are all updated and try again.',
      400,
    );
  }

  // TODO: add explicit types here to translate from raw sheet data to more structured data, based on column headers
  const verificationResult = await verifyParticipants({
    eventId: event.eventId,
    userId: res.locals.user.userId,
    signupUrl,
    feedbackUrl,
    helpersUrl,
  });

  res.status(200).json({
    status: 'success',
    message: 'Points sheet generated successfully',
    data: {
      ...verificationResult,
    },
  } as BaseResponseDTO);
};

export const getEventReportById = catchAsync(
  async (req: Request, res: Response) => {
    const { eventReportId } = req.params;
    const eventReport = await EventModel.getEventReportById({
      eventReportId: eventReportId as string,
    });

    if (!eventReport) {
      throw new APIError('Event report not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Event report retrieved successfully',
      data: {
        ...eventReport,
      },
    });
  },
);

export const getEventReportsByEventId = catchAsync(
  async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const eventReports = await EventModel.getEventReportsByEventId({
      eventId: eventId as string,
    });

    res.status(200).json({
      status: 'success',
      message: 'Event reports retrieved successfully',
      data: eventReports,
    });
  },
);
