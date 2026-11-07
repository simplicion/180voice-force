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
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
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
    port: Number(process.env.PORT) || 4005,
    timestamp: new Date().toISOString()
  });
});

// Root & API Overview Dashboard (Eliminates "Cannot GET /" in browser)
app.get(['/', '/api'], (req: Request, res: Response) => {
  const isHtml = req.accepts('html') && !req.query.json;
  const port = Number(process.env.PORT) || 4005;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3007';

  if (!isHtml) {
    return res.status(200).json({
      service: '180 Voiceforce Dedicated Backend',
      status: 'operational',
      version: '1.0.0',
      port,
      clientUrl,
      timestamp: new Date().toISOString(),
      routes: {
        health: '/health',
        voiceforce: '/api/voiceforce',
        wallet: '/api/wallet',
        company: '/api/v1/company',
        subscription: '/api/v1/subscription/status'
      }
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>180 Voiceforce Dedicated Backend — Port ${port}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
    }
    .container {
      width: 100%;
      max-width: 820px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.07);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #0891b2, #4f46e5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 22px;
      box-shadow: 0 8px 20px rgba(8, 145, 178, 0.25);
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
    }
    .brand-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: #0891b2;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 12px;
      margin-bottom: 28px;
    }
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 14px 16px;
    }
    .metric-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 22px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: linear-gradient(135deg, #0891b2, #0284c7);
      color: #ffffff;
      box-shadow: 0 6px 18px rgba(8, 145, 178, 0.25);
    }
    .btn-primary:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover {
      background: #f1f5f9;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .endpoints-list {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .endpoint-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
      text-decoration: none;
      color: inherit;
      transition: background 0.15s ease;
    }
    .endpoint-item:last-child {
      border-bottom: none;
    }
    .endpoint-item:hover {
      background: #f8fafc;
    }
    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .method {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 7px;
      border-radius: 6px;
    }
    .method-get { background: #e0f2fe; color: #0369a1; }
    .method-post { background: #fef3c7; color: #b45309; }
    .endpoint-path {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      color: #0f172a;
    }
    .endpoint-desc {
      color: #64748b;
      font-size: 12px;
    }
    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <div class="icon-box">🎙️</div>
        <div>
          <div class="brand-title">180 Voiceforce Dedicated Backend</div>
          <div class="brand-subtitle">Autonomous AI Voice Platform & Telephony Engine</div>
        </div>
      </div>
      <div class="status-badge">
        <div class="pulse-dot"></div>
        <span>OPERATIONAL</span>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Server Port</div>
        <div class="metric-value">:${port}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Environment</div>
        <div class="metric-value">${process.env.NODE_ENV || 'development'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Dedicated Frontend</div>
        <div class="metric-value">:3007</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Background Queue</div>
        <div class="metric-value">BullMQ</div>
      </div>
    </div>

    <div class="actions">
      <a href="${clientUrl}" class="btn btn-primary" target="_blank">
        <span>🚀 Launch Voiceforce Web App (Port 3007)</span>
      </a>
      <a href="/health" class="btn btn-secondary">
        <span>🩺 Health Check JSON</span>
      </a>
      <a href="/?json=1" class="btn btn-secondary">
        <span>📋 API Metadata JSON</span>
      </a>
    </div>

    <div class="section-title">📡 Dedicated API Endpoints</div>
    <div class="endpoints-list">
      <a href="/health" class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="endpoint-path">/health</span>
        </div>
        <span class="endpoint-desc">Live Health & Uptime Status</span>
      </a>
      <a href="/api/voiceforce/agents" class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="endpoint-path">/api/voiceforce/agents</span>
        </div>
        <span class="endpoint-desc">Voice Agents List & Settings</span>
      </a>
      <a href="/api/voiceforce/numbers" class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="endpoint-path">/api/voiceforce/numbers</span>
        </div>
        <span class="endpoint-desc">Carrier Phone Numbers & DIDs</span>
      </a>
      <a href="/api/voiceforce/calls" class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="endpoint-path">/api/voiceforce/calls</span>
        </div>
        <span class="endpoint-desc">Call Sessions & Transcripts</span>
      </a>
      <a href="/api/voiceforce/campaigns" class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="endpoint-path">/api/voiceforce/campaigns</span>
        </div>
        <span class="endpoint-desc">Outbound Telephony Campaigns</span>
      </a>
      <a href="/api/wallet" class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="endpoint-path">/api/wallet</span>
        </div>
        <span class="endpoint-desc">Prepaid Telephony Balance</span>
      </a>
      <a href="/api/v1/company" class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="endpoint-path">/api/v1/company</span>
        </div>
        <span class="endpoint-desc">Active Workspace Profile</span>
      </a>
      <a href="/api/v1/subscription/status" class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="endpoint-path">/api/v1/subscription/status</span>
        </div>
        <span class="endpoint-desc">Subscription & Voice Quota Status</span>
      </a>
      <div class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="endpoint-path">/api/voiceforce/webhooks/telnyx</span>
        </div>
        <span class="endpoint-desc">Telnyx SIP Inbound/Outbound Webhook</span>
      </div>
      <div class="endpoint-item">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="endpoint-path">/api/voiceforce/webhooks/livekit</span>
        </div>
        <span class="endpoint-desc">LiveKit WebRTC Audio Webhook</span>
      </div>
    </div>
  </div>

  <div class="footer">
    180 Voiceforce Dedicated Backend • Serving on http://localhost:${port}
  </div>
</body>
</html>`;

  return res.status(200).send(html);
});

// Mount Main Dedicated API Routes
app.use('/api', mainRoutes);
app.use('/', mainRoutes);

// 404 Handler (Clean HTML or JSON instead of default Express 404)
app.use((req: Request, res: Response) => {
  if (req.accepts('html')) {
    const port = Number(process.env.PORT) || 4005;
    return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>404 Not Found - 180 Voiceforce Backend</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
    h1 { font-size: 22px; font-weight: 800; margin-bottom: 8px; color: #0f172a; }
    p { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
    code { background: #f1f5f9; padding: 3px 8px; border-radius: 6px; font-size: 13px; color: #0891b2; font-weight: 600; }
    a { display: inline-block; background: #0891b2; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>404 — Endpoint Not Found</h1>
    <p>The route <code>${req.originalUrl}</code> does not exist on Voice Force Dedicated Backend (:4005).</p>
    <a href="/">← Return to API Overview</a>
  </div>
</body>
</html>`);
  }

  return res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[Voiceforce Backend Error]:', err);
  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

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
