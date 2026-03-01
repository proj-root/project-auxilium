import type { Request, Response } from 'express';
import { accessSheets } from './lib/access-sheets';
import { verifyParticipants } from './lib/verification-engine';
import { BaseResponseDTO } from '@auxilium/types/response';
import { catchAsync } from '@/lib/catch-async';
import * as EventModel from './events.model';
import { APIError } from '@auxilium/types/errors';

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

export const hardDeleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  await EventModel.hardDeleteEventById({ eventId: eventId as string });

  res.status(200).json({
    status: 'success',
    message: 'Event permanently deleted successfully',
  });
});

export const generatePointsSheet = async (req: Request, res: Response) => {
  // Assume URL format is https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit
  const { signupUrl, feedbackUrl, helperUrl, eventName } = req.body;

  // TODO: add url validation and error handling

  // Get responses from each form (including questions headers)
  // TODO: in the future, make a UI for user to select which columns is for what
  // For now assume general structure.
  const signupData = await accessSheets({
    spreadsheetId: signupUrl.split('/')[5],
  });
  const feedbackData = await accessSheets({
    spreadsheetId: feedbackUrl.split('/')[5],
  });

  // TODO: Optimise next time
  const helperData = (
    await accessSheets({
      spreadsheetId: helperUrl.split('/')[5],
    })
  ).filter((row) => row[6] === eventName);

  console.log('Signup Data Sample:', signupData[1]);
  console.log('Feedback Data Sample:', feedbackData[1]);
  console.log('Helper Data Sample:', helperData[1]);

  // Exclude header row
  const signupCount = signupData.length - 1;
  const feedbackCount = feedbackData.length - 1;
  const helperCount = helperData.length;

  // TODO: add explicit types here to translate from raw sheet data to more structured data, based on column headers
  const verificationResult = await verifyParticipants(
    signupData,
    feedbackData,
    helperData,
  );

  const turnupRate = (
    (verificationResult.participants.length / signupCount) *
    100
  ).toFixed(2);

  res.status(200).json({
    status: 'success',
    message: 'Points sheet generated successfully',
    data: {
      signupCount,
      feedbackCount,
      helperCount,
      participants: verificationResult.participants,
      stats: {
        turnupRate: parseFloat(turnupRate),
        ...verificationResult.stats,
      },
    },
  } as BaseResponseDTO);
};
