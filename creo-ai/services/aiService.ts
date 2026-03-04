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

    const prompt = `You are an elite social media content strategist and expert copywriter. Your goal is to generate highly engaging, platform-optimized content for a specific social media platform.

Target Platform: ${platform}
Platform-specific guidelines: ${platformGuidelines[platform]}

User's Idea / Topic: "${idea}"

Instructions:
1. Analyze the core message of the user's idea.
2. Adapt the tone, formatting, and structure to perfectly match the target platform's best practices (e.g., use line breaks, emojis where appropriate, professional vs. casual tone).
3. Ensure the opening acts as a strong hook to stop the scroll.
4. Conclude with a clear, subtle or direct call to action (CTA).
5. Provide 3-5 highly relevant hashtags that mix broad appeal with niche targeting.

Return ONLY valid JSON in this exact format (no markdown blocks, no explanation, just the JSON). Ensure that any newlines or quotes inside the string values are properly escaped (e.g., use \\n for line breaks):
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
