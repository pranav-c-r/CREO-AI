import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';
import { generateImage, modifyImage } from '@/services/imageService';
import { dynamoDb } from '@/lib/dynamoClient';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const POSTS_TABLE = process.env.POSTS_TABLE!;

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // required for large base64 uploads
        },
    },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const requestId = randomUUID().slice(0, 8);
    const startTime = Date.now();
    const log = (msg: string, data?: Record<string, unknown>) =>
        console.log(`[/api/image][${requestId}] ${msg}`, data ? JSON.stringify(data) : '');
    const logError = (msg: string, err: unknown) =>
        console.error(`[/api/image][${requestId}] ${msg}`, err);

    log('Request received', { method: req.method });

    if (req.method !== 'POST') {
        log('Method not allowed', { method: req.method });
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // created_at is the DynamoDB sort key — must be provided alongside post_id
    const { post_id, created_at, mode, prompt, image_base64 } = req.body;
    const userId = req.userId;

    log('Parsed request body', {
        post_id,
        created_at,
        mode,
        promptLength: typeof prompt === 'string' ? prompt.length : null,
        hasImage: !!image_base64,
        userId,
    });

    if (!post_id || !created_at || !mode || !prompt) {
        const missing = ['post_id', 'created_at', 'mode', 'prompt'].filter((k) => !req.body[k]);
        log('Validation failed — missing fields', { missing });
        return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    try {
        let imageUrl = '';

        if (mode === 'generate') {
            log('Starting image generation from text prompt');
            const t0 = Date.now();
            imageUrl = await generateImage(prompt);
            log('Image generation complete', { durationMs: Date.now() - t0, imageUrl });
        } else if (mode === 'modify') {
            if (!image_base64) {
                log('Validation failed — image_base64 missing for modify mode');
                return res.status(400).json({ error: 'image_base64 is required for modify mode' });
            }
            log('Starting image modification');
            const t0 = Date.now();
            imageUrl = await modifyImage(image_base64, prompt);
            log('Image modification complete', { durationMs: Date.now() - t0, imageUrl });
        } else {
            log('Validation failed — invalid mode', { mode });
            return res.status(400).json({ error: `Invalid mode: "${mode}". Must be "generate" or "modify"` });
        }

        // The Posts table key schema: user_id (PK) + created_at (SK — stored as a number)
        const createdAtNum = Number(created_at);
        log('Updating DynamoDB post with image URL', {
            table: POSTS_TABLE,
            userId,
            created_at: createdAtNum,
            post_id,
        });

        await dynamoDb.send(
            new UpdateCommand({
                TableName: POSTS_TABLE,
                Key: {
                    user_id: userId,
                    created_at: createdAtNum,
                },
                // Also assert the post_id matches to avoid updating the wrong record
                ConditionExpression: 'post_id = :pid',
                UpdateExpression: 'SET image_url = :url',
                ExpressionAttributeValues: {
                    ':url': imageUrl,
                    ':pid': post_id,
                },
            })
        );

        log('DynamoDB update successful');
        const totalMs = Date.now() - startTime;
        log('Request complete', { totalMs, imageUrl });

        return res.status(200).json({ image_url: imageUrl });
    } catch (error) {
        const totalMs = Date.now() - startTime;
        logError(`Request failed after ${totalMs}ms`, error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
}

export default withAuth(handler);
