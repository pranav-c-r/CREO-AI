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
    const prompt = `You are a world-class social media analyst and engagement expert. Your task is to critically evaluate a social media post intended for ${platform}.

Post content:
"${content}"

Evaluate the post based on the following strict rubric (0 to 100 scale for each):
- hook_score (0-100): Does the first sentence immediately grab attention, raise curiosity, or present a compelling value proposition?
- clarity_score (0-100): Is the core message easy to understand? Is the formatting readable? Are there any confusing sentences?
- cta_score (0-100): Is there a clear next step or prompt for engagement (e.g., "drop a comment", "click the link")? Is it natural and effective?
- final_score (0-100): Overall potential for high engagement, virality, and alignment with ${platform} algorithms.

Return ONLY valid JSON in this exact format (no markdown blocks or explanations, just the JSON). Ensure that any newlines or quotes inside string values are properly escaped (e.g. \\n):
{
  "hook_score": <number 0-100 here>,
  "clarity_score": <number 0-100 here>,
  "cta_score": <number 0-100 here>,
  "final_score": <number 0-100 here>
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
