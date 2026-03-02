/**
 * POST /api/optimize
 * Validates auth → fetches post → runs optimization → re-scores → saves record → returns diff.
 */
import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';
import { improveHook, improveCTA, suggestHashtags } from '@/services/optimizationService';

type OptimizationType = 'hook' | 'cta' | 'hashtags';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { post_id, optimization_type } = req.body as {
        post_id?: string;
        optimization_type?: string;
    };

    // Input validation
    if (!post_id || typeof post_id !== 'string') {
        return res.status(400).json({ error: 'post_id is required' });
    }

    const validTypes: OptimizationType[] = ['hook', 'cta', 'hashtags'];
    if (!optimization_type || !validTypes.includes(optimization_type as OptimizationType)) {
        return res.status(400).json({
            error: `optimization_type must be one of: ${validTypes.join(', ')}`,
        });
    }

    try {
        const userId = req.userId;
        const type = optimization_type as OptimizationType;

        // Dispatch to the correct optimization function
        let result;
        switch (type) {
            case 'hook':
                result = await improveHook(post_id, userId);
                break;
            case 'cta':
                result = await improveCTA(post_id, userId);
                break;
            case 'hashtags':
                result = await suggestHashtags(post_id, userId);
                break;
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('[/api/optimize] Error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        // Return 404 if the post was not found, 500 otherwise
        const status = message.includes('not found') ? 404 : 500;
        return res.status(status).json({ error: message });
    }
}

export default withAuth(handler);
