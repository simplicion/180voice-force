const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('🎙️   LAUNCHING VOICE FORCE STANDALONE ENVIRONMENT');
console.log('========================================================');

const rootDir = path.resolve(__dirname, '..');

function runProcess(name, command, args, cwd) {
  const isWindows = process.platform === 'win32';
  const execCmd = isWindows ? `${command}.cmd` : command;
  const child = spawn(execCmd, args, {
    cwd,
    stdio: 'inherit',
    shell: isWindows,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  child.on('error', (err) => {
    console.error(`[${name}] Process error:`, err.message);
  });

  child.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.log(`[${name}] Exited with code ${code}`);
    }
  });

  return child;
}

// 1. Start Dedicated Backend & Worker (Port 4005)
console.log('🚀 Starting Voice Force Dedicated Backend on port 4005...');
const backendProc = runProcess(
  'Backend',
  'pnpm',
  ['--filter', '@workspace/voiceforce-backend', 'dev'],
  rootDir
);

// 2. Start Dedicated Frontend (Port 3007)
console.log('🌐 Starting Voice Force Web Frontend on port 3007...');
const frontendProc = runProcess(
  'Frontend',
  'pnpm',
  ['--filter', '@workspace/voiceforce-frontend', 'dev'],
  rootDir
);

function cleanup() {
  console.log('\n🛑 Gracefully shutting down Voice Force services...');
  try {
    backendProc.kill('SIGINT');
  } catch (e) {}
  try {
    frontendProc.kill('SIGINT');
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
