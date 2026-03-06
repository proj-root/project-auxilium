import type { BaseResponseDTO } from '@/types/dto.types';
import type { PaginationOptions } from '@auxilium/types/pagination';

interface EventReport {
  eventReportId: string;
  signupCount: number;
  feedbackCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EventType {
  eventTypeId: number;
  name: string;
}

export interface Event {
  eventId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  platform: string;
  signupUrl: string;
  feedbackUrl: string;
  helpersUrl: string;

  eventType: EventType;

  creator: {
    userId: string;
    profileId: string;
    email: string;
  };

  eventReports: EventReport[];

  createdAt: string;
  updatedAt: string;
}

export type CreateEventRequest = {
  name: string;
  description: string;
  eventTypeId: string;
  startDate?: Date;
  endDate?: Date;
  platform?: string;
  signupUrl?: string;
  feedbackUrl?: string;
  helpersUrl?: string;
};

export type CreateEventResponse = BaseResponseDTO<void>;

export type GetEventByIdResponse = BaseResponseDTO<Event>;

export interface GetAllEventsRequest extends PaginationOptions {
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt';
  eventTypeId?: number;
  statusId?: number;
}

export type GetAllEventsResponse = BaseResponseDTO<
  Omit<Event, 'eventReports'>[]
>;

export type GetAllEventTypesResponse = BaseResponseDTO<EventType[]>;