/**
 * AI Service — Content Generation
 * Calls Amazon Bedrock (Claude) to generate platform-tailored social media content.
 */
import { invokeModel } from '@/lib/bedrockClient';
import { GenerateResult, Platform } from '@/types/post';

/**
 * Generate social media content for a given idea and platform.
 * Returns structured content and suggested hashtags.
 */
export async function generateContent(
    idea: string,
    platform: Platform
): Promise<GenerateResult> {
    const platformGuidelines: Record<Platform, string> = {
        Twitter: 'Keep it under 280 characters, punchy and direct, with strong hook.',
        LinkedIn: 'Professional tone, 150-300 words, storytelling approach, thought leadership.',
        Instagram: 'Visually descriptive, conversational, emotive, 100-200 words.',
    };

    const prompt = `You are a social media content expert. Generate engaging content for ${platform}.

Platform guidelines: ${platformGuidelines[platform]}

User's idea: "${idea}"

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "content": "the generated social media post text",
  "suggested_hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}`;

    const result = await invokeModel<GenerateResult>(prompt);

    // Validate response structure
    if (!result.content || !Array.isArray(result.suggested_hashtags)) {
        throw new Error('Invalid response structure from AI model');
    }

    return result;
}
