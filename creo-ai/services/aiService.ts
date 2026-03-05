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
3. Generate the ENTIRE content in ${targetLanguage === 'English' ? 'English' : `${targetLanguage} language using proper ${targetLanguage} script and characters`}.
4. CRITICAL: If the target language is NOT English, DO NOT mix English words with the target language. Use only pure ${targetLanguage} words that a native speaker would naturally use.
5. VOCABULARY DIVERSITY: Use a rich variety of words and phrases. DO NOT repeat the same word multiple times throughout the post. Each sentence should use different vocabulary.
6. Ensure the opening acts as a strong hook to stop the scroll.
7. Conclude with a clear, subtle or direct call to action (CTA) in ${targetLanguage === 'English' ? 'English' : targetLanguage}.
8. Provide 3-5 highly relevant hashtags that mix broad appeal with niche targeting, in ${targetLanguage === 'English' ? 'English' : targetLanguage}${culturalContext !== 'None' ? ', incorporating culturally relevant hashtags related to ' + culturalContext : ''}.
9. CRITICAL: Return ONLY valid JSON. No explanations, no markdown blocks, no text before or after JSON.
10. The content should be meaningful and flow naturally. Avoid repetitive phrases and overused words.
11. ${targetLanguage === 'English' ? 'Write naturally for English-speaking audience.' : `Write naturally for ${targetLanguage}-speaking audience. Use common ${targetLanguage} expressions, idioms, and cultural references. Do NOT translate English idioms literally - use equivalent ${targetLanguage} expressions.`}

Return ONLY valid JSON in this exact format (no markdown blocks, no explanation, just the JSON). Ensure that any newlines or quotes inside the string values are properly escaped (e.g., use \\n for line breaks):
{
  "content": "the generated social media post text",
  "suggested_hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}`;

    try {
        const result = await invokeModel<GenerateResult>(prompt);

        // Validate response structure
        if (!result.content || !Array.isArray(result.suggested_hashtags)) {
            throw new Error('Invalid response structure from AI model');
        }

        // Additional validation for content quality
        if (result.content.length < 10) {
            throw new Error('Generated content is too short');
        }

        // Check for repetitive content (enhanced detection)
        const words = result.content.split(/\s+/);
        const uniqueWords = new Set(words);

        // Check 1: Overall word diversity
        if (words.length > 20 && uniqueWords.size / words.length < 0.4) {
            // Content is too repetitive, try once more with a stronger prompt
            return generateContentWithRetry(idea, platform, targetLanguage, culturalContext);
        }

        // Check 2: Single word overuse (like repeating "important" multiple times)
        const wordFrequency: Record<string, number> = {};
        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w\u0D00-\u0D7F]/g, ''); // Keep Malayalam characters
            if (cleanWord.length > 2) { // Ignore very short words
                wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
            }
        });

        // If any word appears more than 3 times in a short post, it's overused
        const maxWordCount = Math.max(...Object.values(wordFrequency));
        if (maxWordCount > 3 && words.length < 50) {
            return generateContentWithRetry(idea, platform, targetLanguage, culturalContext);
        }

        // Check 3: Check for the same word appearing in consecutive sentences
        const sentences = result.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 2) {
            for (let i = 1; i < sentences.length; i++) {
                const prevWords = new Set(sentences[i - 1].toLowerCase().split(/\s+/));
                const currWords = sentences[i].toLowerCase().split(/\s+/);
                const commonWords = currWords.filter(word => prevWords.has(word) && word.length > 2);
                if (commonWords.length > 2) {
                    return generateContentWithRetry(idea, platform, targetLanguage, culturalContext);
                }
            }
        }

        return result;
    } catch (error) {
        console.error('[aiService] Error generating content:', error);

        // Re-throw AWS-specific errors with user-friendly messages
        if (error instanceof Error) {
            if (error.message.includes('AWS Access Denied')) {
                throw new Error('AWS Access Denied: Please check your AWS credentials and Bedrock permissions. Please see the browser console for detailed troubleshooting steps.');
            }
            if (error.message.includes('AWS Credentials Error')) {
                throw new Error('AWS Credentials Error: Please ensure your AWS credentials are properly configured in the .env file.');
            }
            if (error.message.includes('AWS Region Error')) {
                throw new Error('AWS Region Error: Please check your AWS region configuration.');
            }
        }

        throw error;
    }
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
- VOCABULARY DIVERSITY: Use different words in each sentence. Do not overuse any single word.
- ${targetLanguage === 'English' ? 'Write naturally in English.' : `Write ONLY in pure ${targetLanguage}. DO NOT mix English words. Use diverse ${targetLanguage} vocabulary.`}
- Write naturally like a native ${targetLanguage} speaker would
- Include 3-5 relevant hashtags in ${targetLanguage}
- Return ONLY JSON format: {"content": "post text", "suggested_hashtags": ["tag1", "tag2"]}

IMPORTANT: Each sentence should bring new vocabulary. Avoid saying the same word multiple times.`;

    const result = await invokeModel<GenerateResult>(retryPrompt);

    if (!result.content || !Array.isArray(result.suggested_hashtags)) {
        throw new Error('Invalid response structure from AI model on retry');
    }

    return result;
}
