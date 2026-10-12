import { setupVoiceforceWorker } from '@workspace/voiceforce';
import { redis } from './config/redis';

export function startWorker() {
  try {
    const vfWorker = setupVoiceforceWorker(redis);
    if (vfWorker) {
      console.log('✅ [Worker] Voiceforce BullMQ worker active on voiceforce-queue');
    }
  } catch (err: any) {
    console.warn('⚠️ [Worker] Voiceforce worker failed to start (Redis offline?):', err.message);
  }
}

if (require.main === module) {
  startWorker();
}
