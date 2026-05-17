import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';
import { errorHandler } from './middleware/errorHandler';

// Load .env FIRST — before anything that reads process.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware (order matters!) ──────────────────────────────────────────────

// CORS: Allow the React frontend to call this API from a different port/domain
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Health check endpoint — useful for Docker and deployment platforms
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ERROR HANDLER must be the very last middleware
// (after all routes and other middleware)
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;
