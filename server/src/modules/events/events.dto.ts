// import { z } from 'zod';
import * as schema from '@/db/schema';

export type EventDTO = typeof schema.event.$inferSelect;

export type GetEventByIdDTO = {
  eventId: string;
};
