/**
 * AI Service — Content Generation
 * Calls Amazon Bedrock (Claude) to generate platform-tailored social media content.
 */
import { invokeModel } from '@/lib/bedrockClient';
import { GenerateResult, Platform, CulturalContext } from '@/types/post';
import { generateCulturalPrompt } from '@/types/culturalContext';

/**
 * Generate social media content for a given idea, platform, target language, and cultural context.
 * Returns structured content and suggested hashtags.
 */
export async function generateContent(
    idea: string,
    platform: Platform,
    targetLanguage: string = 'English',
    culturalContext: CulturalContext = 'None'
): Promise<GenerateResult> {
    const platformGuidelines: Record<Platform, string> = {
        Twitter: 'Keep it under 280 characters, punchy and direct, with strong hook.',
        LinkedIn: 'Professional tone, 150-300 words, storytelling approach, thought leadership.',
        Instagram: 'Visually descriptive, conversational, emotive, 100-200 words.',
    };

    const languageGuidance = targetLanguage === 'English'
        ? 'Generate content in English.'
        : `Generate content in ${targetLanguage} language. Ensure the content is natural, culturally appropriate, and uses common phrases/expressions that native ${targetLanguage} speakers would use. Use proper script and characters for ${targetLanguage}.`;

    const culturalPrompt = generateCulturalPrompt(culturalContext);

    const prompt = `You are an elite social media content strategist and expert copywriter. Your goal is to generate highly engaging, platform-optimized content for a specific social media platform in the target language.

Target Platform: ${platform}
Platform-specific guidelines: ${platformGuidelines[platform]}
Target Language: ${targetLanguage}
Language Guidance: ${languageGuidance}${culturalPrompt}

User's Idea / Topic: "${idea}"

Instructions:
1. Analyze the core message of the user's idea.
2. Adapt the tone, formatting, and structure to perfectly match the target platform's best practices (e.g., use line breaks, emojis where appropriate, professional vs. casual tone).
3. Generate the entire content in ${targetLanguage === 'English' ? 'English' : `${targetLanguage} language using proper ${targetLanguage} script and characters`}.
4. Ensure the opening acts as a strong hook to stop the scroll.
5. Conclude with a clear, subtle or direct call to action (CTA) in ${targetLanguage === 'English' ? 'English' : targetLanguage}.
6. Provide 3-5 highly relevant hashtags that mix broad appeal with niche targeting, in ${targetLanguage === 'English' ? 'English' : targetLanguage}${culturalContext !== 'None' ? ', incorporating culturally relevant hashtags related to ' + culturalContext : ''}.
7. CRITICAL: Return ONLY valid JSON. No explanations, no markdown blocks, no text before or after JSON.
8. The content should be meaningful and not repetitive. Avoid repeating the same phrases multiple times.

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

    // Additional validation for content quality
    if (result.content.length < 10) {
        throw new Error('Generated content is too short');
    }

    // Check for repetitive content (simple heuristic)
    const words = result.content.split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
        // Content is too repetitive, try once more with a stronger prompt
        return generateContentWithRetry(idea, platform, targetLanguage, culturalContext);
    }

    return result;
}

/**
 * Retry function for content generation with stronger anti-repetition instructions
 */
async function generateContentWithRetry(
    idea: string,
    platform: Platform,
    targetLanguage: string,
    culturalContext: CulturalContext
): Promise<GenerateResult> {
    const retryPrompt = `Generate a unique, non-repetitive social media post for ${platform} in ${targetLanguage}.

Topic: "${idea}"

CRITICAL REQUIREMENTS:
- Create original, meaningful content
- DO NOT repeat phrases or sentences
- Write naturally like a human would
- Include 3-5 relevant hashtags
- Return ONLY JSON format: {"content": "post text", "suggested_hashtags": ["tag1", "tag2"]}`;

    const result = await invokeModel<GenerateResult>(retryPrompt);

    if (!result.content || !Array.isArray(result.suggested_hashtags)) {
        throw new Error('Invalid response structure from AI model on retry');
    }

    return result;
}
