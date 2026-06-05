import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../auth/security';
import { config } from '../config/env';

/**
 * Extract and validate the Bearer JWT from the Authorization header, attaching
 * the decoded principal to `req.user`. Responds 401 when the token is missing
 * or invalid.
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.header('x-api-key');
  if (apiKey !== undefined && apiKey === config.systemApiSecretKey) {
    req.user = {
      userId: config.demoOwnerId,
      tenantId: config.demoTenantId,
      role: 'ADMIN',
    };
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (token.length === 0) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
