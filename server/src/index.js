// src/index.js
// Entry point Express.js untuk backend KOMEDWORK
// Setup: CORS, JSON parser, route mounting, centralized error handler

import express    from 'express';
import cors       from 'cors';
import dotenv     from 'dotenv';

import tasksRouter    from './routes/tasks.js';
import projectsRouter from './routes/projects.js';

dotenv.config();

const app  = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

// ----- Middleware -----
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ----- Health check -----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ----- Routes -----
app.use('/api/tasks',    tasksRouter);
app.use('/api/projects', projectsRouter);

// ----- 404 handler -----
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

// ----- Centralized error handler -----
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message || err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.', detail: err.message });
});

// ----- Start server -----
app.listen(PORT, () => {
  console.log(`KOMEDWORK API berjalan di http://localhost:${PORT}`);
  console.log(`CORS origin: ${ALLOWED_ORIGIN}`);
});
