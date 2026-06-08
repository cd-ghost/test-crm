import type { NextFunction, Request, Response } from 'express';
/**
 * Extract and validate the Bearer JWT from the Authorization header, attaching
 * the decoded principal to `req.user`. Responds 401 when the token is missing
 * or invalid.
 */
export declare function authenticateJWT(req: Request, res: Response, next: NextFunction): void;
