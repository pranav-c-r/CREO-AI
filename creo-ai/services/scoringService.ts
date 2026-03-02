/**
 * Scoring Service — Engagement Score
 * Uses Bedrock Claude to score content across 4 dimensions (0–100 each).
 */
import { invokeModel } from '@/lib/bedrockClient';
import { ScoreResult, Platform } from '@/types/post';

/**
 * Score social media content across hook, clarity, CTA, and overall fit.
 * All scores are 0–100.
 */
export async function scoreContent(
    content: string,
    platform: Platform
): Promise<ScoreResult> {
    const prompt = `You are a social media engagement expert. Score the following ${platform} post.

Post content:
"${content}"

Score each dimension from 0 to 100:
- hook_score: How compelling and attention-grabbing is the opening?
- clarity_score: How clear and easy to understand is the message?
- cta_score: How effective is the call-to-action (or implied action)?
- final_score: Overall engagement potential for ${platform} (weighted average)

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "hook_score": 75,
  "clarity_score": 80,
  "cta_score": 70,
  "final_score": 75
}`;

    const result = await invokeModel<ScoreResult>(prompt);

    // Validate all scores are present and numeric
    const keys: (keyof ScoreResult)[] = ['hook_score', 'clarity_score', 'cta_score', 'final_score'];
    for (const key of keys) {
        if (typeof result[key] !== 'number' || result[key] < 0 || result[key] > 100) {
            throw new Error(`Invalid score for ${key}: ${result[key]}`);
        }
    }

    return result;
}
