import express from 'express';
import * as EventsController from './events.controller';
import { Roles } from '@auxilium/configs/roles';
import { verifyIsRole, verifySession } from '@/middleware/auth.middleware';

const EventsRouter = express.Router();

EventsRouter.use(verifySession);
EventsRouter.use(verifyIsRole([Roles.ADMIN, Roles.SUPERADMIN]));

// POST /events - Create a new event
EventsRouter.post('/', EventsController.createEvent);
// POST /events/:eventId/generate - Generate points sheet data for an event
EventsRouter.post('/:eventId/generate', EventsController.generatePointsSheet);

// --- --- ---

// GET /events - Get all events
EventsRouter.get('/', EventsController.getAllEvents);
// GET /events/types - Get all event types
EventsRouter.get('/types', EventsController.getAllEventTypes);
// GET /events/reports/:eventReportId - Get event report details by report ID
EventsRouter.get('/reports/:eventReportId', EventsController.getEventReportById);
// GET /events/reports/:eventReportId/participations - Get event participation records by report ID
EventsRouter.get('/reports/:eventReportId/participations', EventsController.getAllParticipationByReportId);
// GET /events/:eventId - Get event details by ID
EventsRouter.get('/:eventId', EventsController.getEventById);
// GET /events/:eventId/report - Get event reports by event ID
EventsRouter.get('/:eventId/reports', EventsController.getEventReportsByEventId);

// --- --- ---

// PUT /events/:eventId - Update event details
EventsRouter.put('/:eventId', EventsController.updateEvent);

// --- --- ---

// DELETE /events/:eventId/hard - Hard delete an event
EventsRouter.delete('/:eventId/hard', EventsController.hardDeleteEvent);
// DELETE /events/:eventId - Soft delete an event
EventsRouter.delete('/:eventId', EventsController.deleteEvent);

export default EventsRouter;
