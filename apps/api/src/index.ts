import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { trainsRouter } from './routes/trains.routes.js';
import { shareRouter } from './routes/share.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RailGaddi API', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/trains', trainsRouter);
app.use('/api/journeys', shareRouter);

// Fallback 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint does not exist',
      retryable: false
    }
  });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 RailGaddi API service running on http://localhost:${PORT}`);
});
