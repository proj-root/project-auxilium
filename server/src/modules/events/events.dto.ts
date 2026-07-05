import * as schema from '@/db/schema';
import type { PaginationOptions } from '@auxilium/types/pagination';
import { z } from 'zod';

// Event DTO
export type EventDTO = typeof schema.event.$inferSelect;
export type EventReportDTO = typeof schema.eventReport.$inferSelect;
export type EventParticipationDTO = typeof schema.eventParticipation.$inferSelect;
export type EventTypeDTO = typeof schema.eventType.$inferSelect;

// Zod Validation Schemas
export const CreateEventSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  eventTypeId: z.coerce.number().int('Event type must be a valid number'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  platform: z.string().optional(),
  venue: z.string().optional(),
  signupUrl: z.string().optional(),
  feedbackUrl: z.string().optional(),
});

export type CreateEventDTO = z.infer<typeof CreateEventSchema> & {
  createdBy: string;
};

export const UpdateEventSchema = z.object({
  name: z.string().trim().max(100, 'Name must be at most 100 characters').optional(),
  eventTypeId: z.coerce.number().int('Event type must be a valid number').optional(),
  description: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  platform: z.string().optional(),
  venue: z.string().optional(),
  signupUrl: z.string().optional(),
  feedbackUrl: z.string().optional(),
}).refine(
  (data) => Object.values(data).some(value => value !== undefined && value !== ''),
  { message: 'At least one field must be provided for update' }
);

export type UpdateEventDTO = z.infer<typeof UpdateEventSchema> & {
  eventId: string;
};

export const CreateEventReportSchema = z.object({
  signupCount: z.number().int('Signup count must be an integer').optional(),
  feedbackCount: z.number().int('Feedback count must be an integer').optional(),
});

export type CreateEventReportDTO = z.infer<typeof CreateEventReportSchema> & {
  eventId: string;
  createdBy: string;
};

export const CreateEventParticipationSchema = z.object({
  profileId: z.string(),
  attended: z.boolean().optional(),
  eventRoleId: z.number().optional(),
  // pointsType: z.enum(schema.eventPointsType.enumValues).optional(),
  // pointsAwarded: z.number().int('Points awarded must be an integer').optional(),
});

export type CreateEventParticipationDTO = z.infer<typeof CreateEventParticipationSchema> & {
  eventReportId: string;
};

// Query DTOs
export type GetEventByIdDTO = {
  eventId: string;
};

export type GetAllEventsQueryDTO = PaginationOptions & {
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt';
  eventTypeId?: number;
  statusId?: number;
  day?: number;
  month?: number;
  year?: number;
};

export type GetParticipationRecordsQueryDTO = PaginationOptions & {
  eventReportId: string;
  sortBy?: 'name' | 'createdAt';
  statusId?: number;
};

export const AssignUserToEventSchema = z.object({
  userId: z.string(),
  eventRoleId: z.coerce.number().int('Event role ID must be a valid integer'),
});

export type AssignUserToEventDTO = z.infer<typeof AssignUserToEventSchema> & {
  eventId: string;
};

export const UnassignUserFromEventSchema = z.object({
  userId: z.string(),
});

export type UnassignUserFromEventDTO = z.infer<typeof UnassignUserFromEventSchema> & {
  eventId: string;
};