/**
 * GET /api/dashboard
 * Validates auth → loads all user posts → computes analytics → returns DashboardData.
 */
import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';
import { getUserAnalytics } from '@/services/analyticsService';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = await getUserAnalytics(req.userId);
        return res.status(200).json(data);
    } catch (error) {
        console.error('[/api/dashboard] Error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
}

export default withAuth(handler);
