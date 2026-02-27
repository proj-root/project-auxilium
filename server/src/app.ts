import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import EventsRouter from '@/features/events/events.route';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Configure global data acceptance rules
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Configure logging middleware
// TODO: Add logger stuff

// Routes
app.use('/events', EventsRouter)

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'All systems operational.',
  });
});

// Error Handling
// TODO: Add error handling middleware

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}!`);
});