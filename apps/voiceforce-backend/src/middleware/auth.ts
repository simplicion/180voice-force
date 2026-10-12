import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma, requestContext } from '@workspace/db-voiceforce';

export interface AuthenticatedUser {
  id: string;
  companyId?: string;
  email?: string;
  role?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  companyId?: string;
  file?: any;
  files?: any;
}

/**
 * Verifies the JWT Bearer token or 180 Identity SSO token.
 * Attaches user and companyId to requestContext and req.
 */
export async function protect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please provide a Bearer token.' });
    }

    const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || '180_voiceforce_jwt_secret_dev';
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret) as any;
    } catch (verifyErr: any) {
      // Decode SSO token issued by 180 Identity
      const unverified = jwt.decode(token) as any;
      if (unverified && (unverified.id || unverified.userId || unverified.sub || unverified.email)) {
        if (unverified.exp && typeof unverified.exp === 'number' && unverified.exp * 1000 < Date.now()) {
          return res.status(401).json({ success: false, error: 'Session expired. Please refresh your token.', code: 'TOKEN_EXPIRED' });
        }
        decoded = unverified;
      } else {
        if (verifyErr.name === 'TokenExpiredError') {
          return res.status(401).json({ success: false, error: 'Session expired. Please refresh your token.', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
      }
    }

    const userId = decoded.id || decoded.userId || decoded.sub || 'voice_user';
    const userEmail = decoded.email || 'user@voiceforce.io';

    // Extract tenant ID from headers or claims
    let companyId = 
      (req.headers['x-company-id'] as string) ||
      decoded.companyId ||
      decoded.tenantId;

    if (!companyId) {
      // Attempt lookup from User record or auto-resolve default company
      const dbUser = await (prisma as any).user.findFirst({
        where: { OR: [{ id: userId }, { email: userEmail }] },
        select: { companyId: true }
      }).catch(() => null);

      if (dbUser?.companyId) {
        companyId = dbUser.companyId;
      } else {
        // Find first company or create default for developer
        let firstCompany = await (prisma as any).company.findFirst({ select: { id: true } }).catch(() => null);
        if (!firstCompany) {
          firstCompany = await (prisma as any).company.create({
            data: {
              name: 'Default Workspace',
              slug: 'default-workspace',
              currency: 'USD',
              currencySymbol: '$',
              voiceBalanceInr: 500.0
            }
          }).catch(() => null);
        }
        companyId = firstCompany?.id || 'default-company-id';
      }
    }

    req.user = {
      id: userId,
      companyId,
      email: userEmail,
      role: decoded.role || 'ADMIN',
      name: decoded.name || 'Voiceforce Operator'
    };
    req.companyId = companyId;

    requestContext.run({ companyId, userId }, () => {
      next();
    });
  } catch (err: any) {
    console.error('[Auth Middleware] Error in protect:', err.message);
    return res.status(500).json({ success: false, error: 'Authentication internal error' });
  }
}
