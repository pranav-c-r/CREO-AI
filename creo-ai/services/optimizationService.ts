/**
 * Optimization Service
 * Improves hook, CTA, or generates hashtags via Bedrock.
 * After each optimization: re-scores content, computes improvement %, saves to DynamoDB.
 */
import { invokeModel } from '@/lib/bedrockClient';
import { scoreContent } from '@/services/scoringService';
import { dynamoDb } from '@/lib/dynamoClient';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { OptimizationResult, Platform, Post } from '@/types/post';

const OPTIMIZATIONS_TABLE = process.env.OPTIMIZATIONS_TABLE!;
const POSTS_TABLE = process.env.POSTS_TABLE!;

/**
 * Fetch a post from DynamoDB by post_id and user_id
 */
async function fetchPost(post_id: string, user_id: string): Promise<Post> {
    // We need to query by post_id since we know user_id
    const { Item } = await dynamoDb.send(
        new GetCommand({
            TableName: POSTS_TABLE,
            Key: { user_id, post_id },
        })
    );
    if (!Item) throw new Error(`Post ${post_id} not found`);
    return Item as Post;
}

/**
 * Save optimization record to DynamoDB Optimizations table
 */
async function saveOptimization(
    post_id: string,
    optimization_type: string,
    old_score: number,
    new_score: number,
    improvement_percentage: number,
    improved_content: string,
    suggested_hashtags?: string[]
) {
    await dynamoDb.send(
        new PutCommand({
            TableName: OPTIMIZATIONS_TABLE,
            Item: {
                post_id,
                created_at: new Date().toISOString(),
                optimization_id: uuidv4(),
                optimization_type,
                old_score,
                new_score,
                improvement_percentage,
                improved_content,
                ...(suggested_hashtags && { suggested_hashtags }),
            },
        })
    );
}

/**
 * Core optimization runner. Prompts Bedrock, re-scores, computes delta, saves record.
 */
async function runOptimization(
    post: Post,
    optimizationType: string,
    prompt: string
): Promise<OptimizationResult> {
    type ImproveResponse = { improved_content: string; suggested_hashtags?: string[] };
    const result = await invokeModel<ImproveResponse>(prompt);

    if (!result.improved_content) {
        throw new Error('No improved_content in optimization response');
    }

    const [originalScore, improvedScore] = await Promise.all([
        scoreContent(post.content, post.platform as Platform),
        scoreContent(result.improved_content, post.platform as Platform),
    ]);

    const improvement = Math.max(
        0,
        Math.round(((improvedScore.final_score - originalScore.final_score) / Math.max(originalScore.final_score, 1)) * 100)
    );

    await saveOptimization(
        post.post_id,
        optimizationType,
        originalScore.final_score,
        improvedScore.final_score,
        improvement,
        result.improved_content,
        result.suggested_hashtags
    );

    return {
        original_content: post.content,
        improved_content: result.improved_content,
        original_score: originalScore,
        improved_score: improvedScore,
        improvement_percentage: improvement,
        suggested_hashtags: result.suggested_hashtags,
    };
}

/**
 * Rewrite the opening hook of the post to be more attention-grabbing.
 */
export async function improveHook(post_id: string, user_id: string): Promise<OptimizationResult> {
    const post = await fetchPost(post_id, user_id);

    const prompt = `You are a social media copywriting expert. The following ${post.platform} post needs a stronger opening hook.

Original post:
"${post.content}"

Rewrite the post with a more compelling, attention-grabbing opening. Keep the core message intact.

Return ONLY valid JSON in this exact format:
{
  "improved_content": "the full rewritten post with better hook"
}`;

    return runOptimization(post, 'hook', prompt);
}

/**
 * Rewrite the CTA of the post to drive more action.
 */
export async function improveCTA(post_id: string, user_id: string): Promise<OptimizationResult> {
    const post = await fetchPost(post_id, user_id);

    const prompt = `You are a social media copywriting expert. The following ${post.platform} post needs a stronger call-to-action.

Original post:
"${post.content}"

Rewrite the post with a clearer, more compelling call-to-action at the end or woven throughout. Keep the opening and core message the same.

Return ONLY valid JSON in this exact format:
{
  "improved_content": "the full rewritten post with better CTA"
}`;

    return runOptimization(post, 'cta', prompt);
}

/**
 * Suggest optimized hashtags for the post.
 */
export async function suggestHashtags(post_id: string, user_id: string): Promise<OptimizationResult> {
    const post = await fetchPost(post_id, user_id);

    const prompt = `You are a social media hashtag expert. Analyze the following ${post.platform} post and suggest the best performing hashtags.

Post content:
"${post.content}"

Keep the post content the same but append optimized hashtags at the end.

Return ONLY valid JSON in this exact format:
{
  "improved_content": "the original post text with hashtags appended at the end",
  "suggested_hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`;

    return runOptimization(post, 'hashtags', prompt);
}
