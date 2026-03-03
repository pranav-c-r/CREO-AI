/**
 * POST /api/generate
 * Validates auth → generates content → scores it → saves post to DynamoDB → returns result.
 */
import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';
import { generateContent } from '@/services/aiService';
import { scoreContent } from '@/services/scoringService';
import { dynamoDb } from '@/lib/dynamoClient';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from '@/types/post';

const POSTS_TABLE = process.env.POSTS_TABLE!;

const VALID_PLATFORMS: Platform[] = ['Twitter', 'LinkedIn', 'Instagram'];

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { idea, platform } = req.body as { idea?: string; platform?: string };

    // Input validation
    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
        return res.status(400).json({ error: 'idea is required and must be a non-empty string' });
    }
    if (!platform || !VALID_PLATFORMS.includes(platform as Platform)) {
        return res.status(400).json({ error: `platform must be one of: ${VALID_PLATFORMS.join(', ')}` });
    }

    try {
        const typedPlatform = platform as Platform;
        const userId = req.userId;

        // 1. Generate content via AI
        const generated = await generateContent(idea.trim(), typedPlatform);

        // 2. Score the generated content
        const scores = await scoreContent(generated.content, typedPlatform);

        // 3. Build the post record
        const post = {
            user_id: userId,
            created_at: Date.now(),
            post_id: uuidv4(),
            content: generated.content,
            platform: typedPlatform,
            idea: idea.trim(),
            suggested_hashtags: generated.suggested_hashtags,
            ...scores,
        };

        // 4. Persist to DynamoDB Posts table
        await dynamoDb.send(
            new PutCommand({
                TableName: POSTS_TABLE,
                Item: post,
            })
        );

        return res.status(200).json(post);
    } catch (error) {
        console.error('[/api/generate] Error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
}

export default withAuth(handler);
