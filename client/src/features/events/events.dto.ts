import type { BaseResponseDTO } from '@/types/dto.types';
import type { PaginationOptions } from '@auxilium/types/pagination';
import type { UserDTO, UserProfileDTO } from '../user/user.dto';

export enum CCAPointsType {
  PARTICIPATION = 'PARTICIPATION',
  LEADERSHIP = 'LEADERSHIP',
  SERVICE = 'SERVICE',
  COMMUNITY_SERVICE = 'COMMUNITY SERVICE',
}

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

export interface EventRole {
  eventRoleId: number;
  name: string;
  pointsType: CCAPointsType;
  pointsAwarded: number;
}

export interface UserEventRole {
  eventId: string;
  eventRole: EventRole;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    userProfile: UserProfileDTO;
  };
}

export interface Event {
  eventId: string;
  name: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  platform: string | null;
  venue: string | null;
  signupUrl: string | null;
  feedbackUrl: string | null;

  eventReport: EventReport | null;

  eventType: EventType;

  creator: {
    userId: string;
    profileId: string;
    email: string;
  };

  userEventRoles: UserEventRole[];

  // eventReports: EventReport[];

  createdAt: string;
  updatedAt: string;
}

export interface EventParticipation {
  participationId: string;
  eventReportId: string;
  profileId: string;
  attended: boolean;
  eventRole: EventRole;

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
};

export type CreateEventResponse = BaseResponseDTO<void>;

export type UpdateEventRequest = {
  eventId: string;
  name?: string;
  description?: string;
  eventTypeId?: string;
  startDate?: Date;
  endDate?: Date;
  platform?: string;
  signupUrl?: string;
  feedbackUrl?: string;
};

export type UpdateEventResponse = BaseResponseDTO<void>;

export type GetEventByIdResponse = BaseResponseDTO<Event>;

export interface GetAllEventsRequest extends PaginationOptions {
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt';
  eventTypeId?: number;
  statusId?: number;
  day?: number;
  month?: number;
  year?: number;
  search?: string;
}

export type GetAllEventsResponse = BaseResponseDTO<
  Omit<Event, 'eventReports'>[]
>;

export type GetAllEventTypesResponse = BaseResponseDTO<EventType[]>;

export type GetAllEventRolesResponse = BaseResponseDTO<EventRole[]>;

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

export interface AssignUserToEventRequest {
  eventId: string;
  eventRoleId: string;
  userId: string;
};

export type AssignUserToEventResponse = BaseResponseDTO<void>;