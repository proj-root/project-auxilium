import express from 'express';
import { generatePointsSheet } from './events.controller';

const EventsRouter = express.Router();

EventsRouter.post('/points/generate', generatePointsSheet);

export default EventsRouter;