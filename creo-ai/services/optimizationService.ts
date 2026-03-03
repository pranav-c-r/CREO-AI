/**
 * Optimization Service
 * Improves hook, CTA, or generates hashtags via Bedrock.
 * After each optimization: re-scores content, computes improvement %, saves to DynamoDB.
 */
import { invokeModel } from '@/lib/bedrockClient';
import { scoreContent } from '@/services/scoringService';
import { dynamoDb } from '@/lib/dynamoClient';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { OptimizationResult, Platform, Post } from '@/types/post';

const OPTIMIZATIONS_TABLE = process.env.OPTIMIZATIONS_TABLE!;
const POSTS_TABLE = process.env.POSTS_TABLE!;

/**
 * Fetch a post from DynamoDB by post_id and user_id using Query since we lack created_at sort key
 */
async function fetchPost(post_id: string, user_id: string): Promise<Post> {
    const { Items } = await dynamoDb.send(
        new QueryCommand({
            TableName: POSTS_TABLE,
            KeyConditionExpression: 'user_id = :uid',
            FilterExpression: 'post_id = :pid',
            ExpressionAttributeValues: {
                ':uid': user_id,
                ':pid': post_id,
            },
        })
    );
    if (!Items || Items.length === 0) throw new Error(`Post ${post_id} not found`);
    return Items[0] as Post;
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

    const prompt = `You are an expert social media copywriter specializing in viral content. Your task is to dramatically improve the opening "hook" of the following ${post.platform} post.

Original post:
"${post.content}"

Instructions:
1. Analyze the post and identify its core value proposition.
2. Rewrite the opening 1-2 sentences to be extremely compelling, curiosity-inducing, or surprisingly insightful. The goal is to maximize the "stop-scrolling" effect.
3. Ensure the tone matches the rest of the post and is suitable for ${post.platform}.
4. Do not alter the core message or the call-to-action; focus solely on making the beginning irresistible.

Return ONLY valid JSON in this exact format (no markdown blocks or explanations, just the JSON):
{
  "improved_content": "the full rewritten post with the newly optimized powerful hook"
}`;

    return runOptimization(post, 'hook', prompt);
}

/**
 * Rewrite the CTA of the post to drive more action.
 */
export async function improveCTA(post_id: string, user_id: string): Promise<OptimizationResult> {
    const post = await fetchPost(post_id, user_id);

    const prompt = `You are an expert social media copywriter specializing in conversion rate optimization and community engagement. Your task is to improve the Call-To-Action (CTA) of the following ${post.platform} post.

Original post:
"${post.content}"

Instructions:
1. Review the post content.
2. Rewrite the ending (or weave throughout) to include a highly effective, clear, and compelling CTA.
3. Depending on the post's context, the CTA could encourage commenting, sharing, clicking a link, or saving the post. Ensure the CTA feels natural and drives immediate action.
4. Keep the original opening and body intact as much as possible, only modifying the text to integrate the new CTA smoothly.

Return ONLY valid JSON in this exact format (no markdown blocks or explanations, just the JSON):
{
  "improved_content": "the full rewritten post with the optimized CTA"
}`;

    return runOptimization(post, 'cta', prompt);
}

/**
 * Suggest optimized hashtags for the post.
 */
export async function suggestHashtags(post_id: string, user_id: string): Promise<OptimizationResult> {
    const post = await fetchPost(post_id, user_id);

    const prompt = `You are an algorithm and discoverability expert for social media platforms. Your task is to provide the optimal mix of hashtags for the following ${post.platform} post.

Post content:
"${post.content}"

Instructions:
1. Analyze the context, target audience, and main keywords of the post.
2. Generate 4 to 7 highly strategic hashtags. Include a mix of broad trending tags for reach, and niche tags for targeted engagement.
3. Append these suggested hashtags to the end of the post content seamlessly (or format them as appropriate for ${post.platform}).

Return ONLY valid JSON in this exact format (no markdown blocks or explanations, just the JSON):
{
  "improved_content": "the original post text with the new hashtags appended correctly at the bottom",
  "suggested_hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`;

    return runOptimization(post, 'hashtags', prompt);
}
