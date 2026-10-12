import { Router } from 'express';
import voiceforceRoutes from '../api/v1/voiceforce/index';
import walletRoutes from '../api/v1/wallet/index';

const router: Router = Router();

// ─── 180 Voiceforce Dedicated Endpoints ─────────────────────────────────────
router.use('/voiceforce', voiceforceRoutes);
router.use('/v1/voiceforce', voiceforceRoutes);

// ─── 180 Dedicated Prepaid Wallet Engine ────────────────────────────────────
router.use('/wallet', walletRoutes);
router.use('/v1/wallet', walletRoutes);

export default router;
