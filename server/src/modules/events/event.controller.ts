import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { EventsService } from './event.service';

const ROUTE_NAME = 'api/events';

@Controller(ROUTE_NAME)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  constructor(private readonly eventsService: EventsService) {}

  // GET /api/events/:id
  @Get(':id')
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
}
