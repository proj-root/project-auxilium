import db from '@/db';
import { Injectable } from '@nestjs/common';

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
        eventReports: {
          orderBy: {
            createdAt: 'desc',
          },
          limit: 25,
        },
      },
    });

    return event;
  }
}
