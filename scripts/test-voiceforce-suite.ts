import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend
dotenv.config({ path: path.resolve(__dirname, '../apps/voiceforce-backend/.env') });

import axios from 'axios';
import Redis from 'ioredis';
import { prisma } from '../packages/db-voiceforce';
import { AccessToken } from 'livekit-server-sdk';
import express from 'express';
import mainRoutes from '../apps/voiceforce-backend/src/routes/index.routes';

interface TestResult {
  category: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details?: any;
}

const results: TestResult[] = [];

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('   180 VOICE FORCE COMPREHENSIVE ENDPOINT & CREDENTIAL TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // 1. Cartesia Neural Voice Verification
  // -------------------------------------------------------------
  try {
    const cartesiaKey = process.env.CARTESIA_API_KEY;
    console.log('[1/5] Verifying Cartesia Neural Voice Credentials...');
    const cartesiaRes = await axios.get('https://api.cartesia.ai/voices', {
      headers: {
        'X-API-Key': cartesiaKey,
        'Cartesia-Version': '2024-06-10'
      },
      timeout: 10000
    });
    const voiceCount = Array.isArray(cartesiaRes.data) ? cartesiaRes.data.length : 0;
    results.push({
      category: 'CREDENTIALS',
      name: 'Cartesia API Key & Voice Catalog',
      status: 'PASS',
      details: `Active - Retrieved ${voiceCount} neural voices`
    });

    // Test Cartesia TTS bytes generation
    const ttsRes = await axios.post(
      'https://api.cartesia.ai/tts/bytes',
      {
        model_id: 'sonic-3.6',
        transcript: 'Voice Force system online.',
        voice: {
          mode: 'id',
          id: 'a0e99841-438c-4a64-b679-ae501e7d6091'
        },
        output_format: {
          container: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: 16000
        }
      },
      {
        headers: {
          'X-API-Key': cartesiaKey,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 10000
      }
    );
    results.push({
      category: 'CREDENTIALS',
      name: 'Cartesia Sonic-3.6 Neural Audio Generation',
      status: 'PASS',
      details: `Generated ${ttsRes.data.length} bytes of raw audio`
    });
  } catch (err: any) {
    results.push({
      category: 'CREDENTIALS',
      name: 'Cartesia Verification',
      status: 'FAIL',
      details: err.response?.data?.message || err.message
    });
  }

  // -------------------------------------------------------------
  // 2. Telnyx Programmable Voice & SIP Trunk Verification
  // -------------------------------------------------------------
  try {
    console.log('[2/5] Verifying Telnyx SIP & Phone Carrier Credentials...');
    const telnyxKey = process.env.TELNYX_API_KEY;
    const phoneRes = await axios.get('https://api.telnyx.com/v2/phone_numbers', {
      headers: { Authorization: `Bearer ${telnyxKey}` },
      timeout: 10000
    });
    const numbers = phoneRes.data?.data || [];
    const activeNumber = numbers[0]?.phone_number || 'None';
    const connId = numbers[0]?.connection_id || 'None';

    results.push({
      category: 'CREDENTIALS',
      name: 'Telnyx API Key & Phone Numbers',
      status: 'PASS',
      details: `Active DID: ${activeNumber}, Connection ID: ${connId}`
    });

    results.push({
      category: 'CREDENTIALS',
      name: 'Telnyx SIP Connection ID Matching',
      status: connId === process.env.TELNYX_SIP_CONNECTION_ID ? 'PASS' : 'WARN',
      details: `Matched: ${connId}`
    });
  } catch (err: any) {
    results.push({
      category: 'CREDENTIALS',
      name: 'Telnyx Verification',
      status: 'FAIL',
      details: err.response?.data?.errors?.[0]?.detail || err.message
    });
  }

  // -------------------------------------------------------------
  // 3. LiveKit WebRTC Token & Auth Verification
  // -------------------------------------------------------------
  try {
    console.log('[3/5] Verifying LiveKit WebRTC Security Tokens...');
    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;
    const at = new AccessToken(apiKey, apiSecret, {
      identity: 'test_telephony_agent',
      ttl: '1h'
    });
    at.addGrant({
      room: 'test_room',
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    });
    const jwt = await at.toJwt();
    results.push({
      category: 'CREDENTIALS',
      name: 'LiveKit JWT Token Signing & Grants',
      status: 'PASS',
      details: `Signed JWT (length: ${jwt.length}, algorithm: HS256)`
    });

    const livekitUrl = process.env.LIVEKIT_URL!;
    const lkRes = await axios.get(livekitUrl, { timeout: 8000, validateStatus: () => true });
    results.push({
      category: 'INFRASTRUCTURE',
      name: 'LiveKit Server Host Endpoint',
      status: lkRes.status === 200 ? 'PASS' : 'WARN',
      details: `${livekitUrl} returned HTTP ${lkRes.status}`
    });
  } catch (err: any) {
    results.push({
      category: 'CREDENTIALS',
      name: 'LiveKit Verification',
      status: 'FAIL',
      details: err.message
    });
  }

  // -------------------------------------------------------------
  // 4. Redis & PostgreSQL Verification
  // -------------------------------------------------------------
  try {
    console.log('[4/5] Verifying Redis & PostgreSQL Database...');
    const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    await redis.set('test_voiceforce_ping', 'ok', 'EX', 10);
    const val = await redis.get('test_voiceforce_ping');
    await redis.disconnect();

    results.push({
      category: 'INFRASTRUCTURE',
      name: 'Redis Cache & Queue Engine',
      status: val === 'ok' ? 'PASS' : 'FAIL',
      details: `${process.env.REDIS_URL} (Read/Write OK)`
    });

    const companyCount = await (prisma as any).company.count();
    const agentCount = await (prisma as any).voiceAgent.count();
    const phoneCount = await (prisma as any).phoneNumber.count();

    results.push({
      category: 'DATABASE',
      name: 'PostgreSQL RDS Database Connection',
      status: 'PASS',
      details: `Connected - Companies: ${companyCount}, Agents: ${agentCount}, Phone Numbers: ${phoneCount}`
    });
  } catch (err: any) {
    results.push({
      category: 'DATABASE',
      name: 'PostgreSQL / Redis Verification',
      status: 'FAIL',
      details: err.message
    });
  }

  // -------------------------------------------------------------
  // 5. Backend API Endpoints Verification
  // -------------------------------------------------------------
  console.log('[5/5] Testing Voice Force Backend Endpoints via Express App...');
  const app = express();
  app.use(express.json());

  // Generate valid test JWT token using JWT_SECRET
  const jwtSecret = process.env.JWT_SECRET || '195ee7cdf2272463be82f5d065eaf1dc52992c6d5c05241e7cde005eb2cbc71b';
  const testCompany = await (prisma as any).company.findFirst().catch(() => null);
  const companyId = testCompany?.id || 'comp_voiceforce_default';
  
  const jwt = await import('jsonwebtoken');
  const authToken = jwt.default.sign(
    {
      id: 'usr_voiceforce_admin',
      userId: 'usr_voiceforce_admin',
      email: 'admin@180workspace.com',
      role: 'SUPER_ADMIN',
      companyId: companyId,
      name: 'Super Admin'
    },
    jwtSecret,
    { expiresIn: '1h' }
  );

  app.use('/', mainRoutes);

  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const authHeaders = {
    Authorization: `Bearer ${authToken}`,
    'x-company-id': companyId
  };

  const endpointsToTest = [
    { method: 'GET', path: '/company', name: 'Workspace Company Metadata' },
    { method: 'GET', path: '/subscription/status', name: 'Subscription Status' },
    { method: 'GET', path: '/voiceforce/metrics', name: 'Dashboard Metrics' },
    { method: 'GET', path: '/voiceforce/agents', name: 'List AI Voice Employees' },
    { method: 'GET', path: '/voiceforce/voices', name: 'Cartesia Neural Voices Catalog' },
    { method: 'GET', path: '/voiceforce/engine/specs', name: 'Voice Engine Technical Specs' },
    { method: 'GET', path: '/voiceforce/simulate/scenarios', name: 'Simulation Scenarios' },
    { method: 'GET', path: '/voiceforce/analytics/roi', name: 'Executive ROI Analytics' },
    { method: 'GET', path: '/voiceforce/briefings/latest', name: 'Daily Executive Briefing' },
    { method: 'GET', path: '/voiceforce/templates', name: 'Prebuilt Industry Templates' },
    { method: 'GET', path: '/voiceforce/numbers', name: 'Phone Numbers Portfolio' },
    { method: 'GET', path: '/voiceforce/forwarding', name: 'Forwarding & Routing Rules' },
    { method: 'GET', path: '/voiceforce/queues', name: 'Call Hold Queues' },
    { method: 'GET', path: '/voiceforce/campaigns', name: 'Outbound Campaigns' },
    { method: 'GET', path: '/voiceforce/rates/estimate?destinationNumber=+12176296403', name: 'Dynamic Rate Estimation' },
    { method: 'GET', path: '/voiceforce/calls', name: 'Call Logs & Records' },
    { method: 'GET', path: '/voiceforce/dnc', name: 'Do-Not-Call (DNC) Registry' },
    { method: 'GET', path: '/voiceforce/knowledge/documents', name: 'Knowledge Vault Documents' },
    { method: 'GET', path: '/voiceforce/superadmin/overview', name: 'Superadmin Platform Overview' },
    { method: 'GET', path: '/wallet', name: 'Prepaid Voice Wallet' },
    {
      method: 'POST',
      path: '/voiceforce/tokens/generate',
      body: {},
      name: 'WebRTC Softphone Token Generator'
    }
  ];

  for (const ep of endpointsToTest) {
    try {
      let res: any;
      if (ep.method === 'GET') {
        res = await axios.get(`${baseUrl}${ep.path}`, { headers: authHeaders, timeout: 8000 });
      } else {
        res = await axios.post(`${baseUrl}${ep.path}`, ep.body, { headers: authHeaders, timeout: 8000 });
      }
      results.push({
        category: 'ENDPOINT',
        name: `${ep.method} ${ep.path} (${ep.name})`,
        status: res.status >= 200 && res.status < 300 ? 'PASS' : 'WARN',
        details: `HTTP ${res.status} - ${JSON.stringify(res.data).slice(0, 75)}...`
      });
    } catch (err: any) {
      results.push({
        category: 'ENDPOINT',
        name: `${ep.method} ${ep.path} (${ep.name})`,
        status: 'FAIL',
        details: `HTTP ${err.response?.status || 'ERR'}: ${JSON.stringify(err.response?.data || err.message).slice(0, 100)}`
      });
    }
  }

  server.close();

  // -------------------------------------------------------------
  // Display Results Summary Table
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('                      TEST SUITE SUMMARY                        ');
  console.log('================================================================');
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const r of results) {
    const symbol = r.status === 'PASS' ? '✅ PASS' : r.status === 'WARN' ? '⚠️ WARN' : '❌ FAIL';
    if (r.status === 'PASS') passCount++;
    else if (r.status === 'WARN') warnCount++;
    else failCount++;
    console.log(`${symbol.padEnd(8)} [${r.category.padEnd(14)}] ${r.name.padEnd(45)} -> ${r.details}`);
  }

  console.log('================================================================');
  console.log(`TOTAL: ${results.length} | PASS: ${passCount} | WARN: ${warnCount} | FAIL: ${failCount}`);
  console.log('================================================================\n');

  process.exit(failCount > 0 ? 1 : 0);
}

runTestSuite().catch(e => {
  console.error('Test Suite Fatal Error:', e);
  process.exit(1);
});
