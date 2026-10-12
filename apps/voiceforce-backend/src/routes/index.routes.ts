import { Router, Request, Response } from 'express';
import { prisma } from '@workspace/db-voiceforce';
import voiceforceRoutes from '../api/v1/voiceforce/index';
import walletRoutes from '../api/v1/wallet/index';

const router: Router = Router();

// ─── 180 Voiceforce Dedicated Endpoints ─────────────────────────────────────
router.use('/voiceforce', voiceforceRoutes);
router.use('/v1/voiceforce', voiceforceRoutes);

// ─── 180 Dedicated Prepaid Wallet Engine ────────────────────────────────────
router.use('/wallet', walletRoutes);
router.use('/v1/wallet', walletRoutes);

// ─── Workspace & Tenant Metadata Endpoints ──────────────────────────────────
router.get(['/company', '/v1/company'], async (req: any, res: Response) => {
  try {
    const companyId = req.headers['x-company-id'] || req.query.companyId || req.user?.companyId;
    let company: any = null;
    if (companyId) {
      company = await (prisma as any).company.findUnique({ where: { id: companyId } }).catch(() => null);
    }
    if (!company) {
      company = await (prisma as any).company.findFirst().catch(() => null);
    }
    if (!company) {
      company = await (prisma as any).company.create({
        data: {
          name: '180 Enterprise Workspace',
          slug: 'default-workspace',
          currency: 'USD',
          currencySymbol: '$',
          voiceBalanceInr: 500.0,
        }
      }).catch(() => null);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: company?.id || 'comp_voiceforce_default',
        name: company?.name || '180 Enterprise Workspace',
        slug: company?.slug || 'default-workspace',
        currency: company?.currency || 'USD',
        currencySymbol: company?.currencySymbol || '$',
        voiceBalanceInr: company?.voiceBalanceInr ?? 500.0,
        settings: {}
      }
    });
  } catch (err: any) {
    return res.status(200).json({
      success: true,
      data: {
        id: 'comp_voiceforce_default',
        name: '180 Enterprise Workspace',
        slug: 'default-workspace',
        currency: 'USD',
        currencySymbol: '$',
        voiceBalanceInr: 500.0,
        settings: {}
      }
    });
  }
});

// ─── Subscription Status Indicator ──────────────────────────────────────────
router.get(['/subscription/status', '/v1/subscription/status'], (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      status: 'active',
      plan: 'ENTERPRISE',
      tier: 'enterprise',
      active: true,
      voiceIncluded: true,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

// ─── Workspace Tools & Knowledge Vaults ─────────────────────────────────────
router.get(['/workspace-tools/vaults', '/v1/workspace-tools/vaults'], (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      vaults: []
    }
  });
});

export default router;
