import { Router } from 'express';
import { WalletController } from './wallet.controller';
import { protect } from '../../../middleware/auth';

const router: Router = Router();

// ─── Public Webhooks (Cryptographically verified by HMAC SHA-256) ─────────────
router.post('/webhooks/razorpay', WalletController.handleRazorpayWebhook);
router.post('/webhooks/180-pay', WalletController.handle180PayWebhook);

// ─── Protected Multi-Tenant Wallet Endpoints ──────────────────────────────────
router.get('/', protect, WalletController.getWallet);
router.get('/transactions', protect, WalletController.getTransactions);
router.get('/transactions/export', protect, WalletController.exportTransactions);
router.get('/transactions/:id/receipt', protect, WalletController.getReceipt);

router.post('/coupon/validate', protect, WalletController.validateCoupon);
router.post('/order', protect, WalletController.createOrder);
router.post('/verify', protect, WalletController.verifyPayment);

router.put('/settings', protect, WalletController.updateSettings);

export default router;
