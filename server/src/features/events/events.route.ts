import express from 'express';
import * as EventsController from './events.controller';
import { verifyIsRole, verifyJWT } from '@/middleware/auth.middleware';
import { Roles } from '@auxilium/configs/roles';

const EventsRouter = express.Router();

EventsRouter.use(verifyJWT);
EventsRouter.use(verifyIsRole([Roles.ADMIN, Roles.SUPERADMIN]));

// POST /events - Create a new event
EventsRouter.post('/', EventsController.createEvent);

// GET /events - Get all events
EventsRouter.get('/', EventsController.getAllEvents);
// GET /events/:eventId - Get event details by ID
EventsRouter.get('/:eventId', EventsController.getEventById);

// PUT /events/:eventId - Update event details
EventsRouter.put('/:eventId', EventsController.updateEvent);

// DELETE /events/:eventId/hard - Hard delete an event
EventsRouter.delete('/:eventId/hard', EventsController.hardDeleteEvent);
// DELETE /events/:eventId - Soft delete an event
EventsRouter.delete('/:eventId', EventsController.deleteEvent);


EventsRouter.post('/points/generate', EventsController.generatePointsSheet);

export default EventsRouter;
