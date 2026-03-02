/**
 * Auth middleware for API routes.
 * Validates Cognito JWT and extracts user_id (sub claim).
 * Wrap any API handler with `withAuth` to protect it.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Create verifier once (it caches the JWKS internally)
const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    tokenUse: 'access',
    clientId: process.env.COGNITO_CLIENT_ID!,
});

export type AuthenticatedRequest = NextApiRequest & {
    userId: string;
};

type ApiHandler = (
    req: AuthenticatedRequest,
    res: NextApiResponse
) => Promise<void> | void;

/**
 * Higher-order function that wraps an API handler with JWT auth validation.
 * On success, injects `req.userId` (the Cognito `sub` claim).
 * On failure, returns 401 with an error message.
 */
export function withAuth(handler: ApiHandler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const payload = await verifier.verify(token);
            // Attach user_id to the request object for downstream use
            (req as AuthenticatedRequest).userId = payload.sub;
            return handler(req as AuthenticatedRequest, res);
        } catch {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    };
}
