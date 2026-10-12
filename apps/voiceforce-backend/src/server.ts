import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import mainRoutes from './routes/index.routes';
import { startWorker } from './worker';

const app = express();
const server = http.createServer(app);

app.set('trust proxy', true);

// Security & Performance
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// Request Body Parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration for Voice Force Web & Telephony Webhooks
const allowedOrigins = [
  'http://localhost:3007',
  'http://localhost:3000',
  'https://voiceforce.vanityworkspace.com',
  'https://voice.180.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-company-id',
      'x-workspace-id',
      'x-requested-with',
      'Accept',
      'Origin',
      'Idempotency-Key',
      'idempotency-key'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  })
);

// Health Check
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'voiceforce-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Main Dedicated API Routes
app.use('/api', mainRoutes);
app.use('/', mainRoutes);

// Start BullMQ Background Worker
startWorker();

const PORT = Number(process.env.PORT) || 4005;

server.listen(PORT, '0.0.0.0', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎙️  VOICE FORCE DEDICATED BACKEND ACTIVE');
  console.log(`🚀  Listening on: http://localhost:${PORT}`);
  console.log(`📡  API Endpoints: http://localhost:${PORT}/api/voiceforce`);
  console.log(`💳  Wallet Engine: http://localhost:${PORT}/api/wallet`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

export default app;
