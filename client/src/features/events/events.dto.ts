import type { BaseResponseDTO } from '@/types/dto.types';
import type { PaginationOptions } from '@auxilium/types/pagination';
import type { UserDTO, UserProfileDTO } from '../user/user.dto';

export interface EventReport {
  eventReportId: string;
  signupCount: number;
  feedbackCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventType {
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

export interface EventParticipation {
  participationId: string;
  eventReportId: string;
  profileId: string;
  attended: boolean;
  eventRole: string;
  pointsType: string;
  pointsAwarded: number;

  userProfile: UserProfileDTO;

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

export type GenerateEventReportResponse = BaseResponseDTO<void>;

export type GetEventReportByIdResponse = BaseResponseDTO<
  {
    eventId: string;
    eventParticipations: EventParticipation[];
    creator: Omit<UserDTO, 'userProfile'>;
  } & EventReport
>;

export interface GetParticipationsByReportIdRequest extends PaginationOptions {
  eventReportId: string;
}

export type GetParticipationsByReportIdResponse = BaseResponseDTO<{
  pageCount: number;
  participations: EventParticipation[];
}>;
