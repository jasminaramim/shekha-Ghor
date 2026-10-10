import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, isDbConnected } from './server/db/connection.js';
import { seedDatabase } from './server/db/seed.js';

import authRoutes from './server/routes/auth.js';
import coursesRoutes from './server/routes/courses.js';
import categoriesRoutes from './server/routes/categories.js';
import progressRoutes from './server/routes/progress.js';
import adminRoutes from './server/routes/admin.js';
import reportsRoutes from './server/routes/reports.js';
import videosRoutes from './server/routes/videos.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health / Status Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'শেখাঘর',
    database: isDbConnected() ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);

// Lazy DB connection middleware for serverless (Vercel)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && !isDbConnected()) {
    await connectDB();
  }
  next();
});

async function startServer() {
  // Connect to MongoDB & Seed
  const connected = await connectDB();
  if (connected) {
    await seedDatabase();
  } else {
    console.warn('[Warning] Running without primary database connection. Retrying in background...');
    setInterval(async () => {
      if (!isDbConnected()) {
        const ok = await connectDB();
        if (ok) await seedDatabase();
      }
    }, 15000);
  }

  // Vite Integration in Development / Static in Production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[শেখাঘর] Server is running on http://0.0.0.0:${PORT}`);
  });
}

// Only start the server if not running on Vercel
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
  });
}

export default app;
