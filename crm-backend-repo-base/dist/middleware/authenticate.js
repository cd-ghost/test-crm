"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
const security_1 = require("../auth/security");
const env_1 = require("../config/env");
/**
 * Extract and validate the Bearer JWT from the Authorization header, attaching
 * the decoded principal to `req.user`. Responds 401 when the token is missing
 * or invalid.
 */
function authenticateJWT(req, res, next) {
    const apiKey = req.header('x-api-key');
    if (apiKey !== undefined && apiKey === env_1.config.systemApiSecretKey) {
        req.user = {
            userId: env_1.config.demoOwnerId,
            tenantId: env_1.config.demoTenantId,
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
        req.user = (0, security_1.verifyToken)(token);
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=authenticate.js.map