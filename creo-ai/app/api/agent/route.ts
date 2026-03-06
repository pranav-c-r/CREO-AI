import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { tool, ToolLoopAgent, createAgentUIStreamResponse, stepCountIs } from 'ai';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { scoreContent } from '@/services/scoringService';
import { Platform, IndicLanguage, CulturalContext } from '@/types/post';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { dynamoDb } from '@/lib/dynamoClient';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.COGNITO_CLIENT_ID!,
});

const POSTS_TABLE = process.env.POSTS_TABLE!;

// Allow up to 60 seconds for multi-step agent interactions
export const maxDuration = 60;

const bedrock = createAmazonBedrock({
  region: process.env.AWS_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});

export async function POST(req: Request) {
  const { messages, platform, targetLanguage, culturalContext } = await req.json();

  // Extract userId from Bearer token so we can save the post to DynamoDB.
  // This is optional — if no valid token, userId stays null and we skip the save.
  let userId: string | null = null;
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = await verifier.verify(token);
      userId = payload.sub;
    }
  } catch {
    // Token missing or invalid — agent still works, just won't save to DynamoDB
  }

  console.log('[Agent Request]', {
    platform,
    targetLanguage,
    culturalContext,
    messageCount: messages.length,
    userId: userId ?? 'unauthenticated',
  });

  const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';

  // ToolLoopAgent runs the model in a loop, calling tools until stopWhen is met.
  // In AI SDK v6, tools use `inputSchema` (renamed from `parameters`).
  const agent = new ToolLoopAgent({
    model: bedrock(modelId),
    temperature: 1,  // More creative, varied output
    instructions: `You are a world-class social media copywriter and content strategist. Your job is to create rich, engaging, long-form posts that stop the scroll.

Platform: ${platform || 'General'} | Language: ${targetLanguage || 'English'} | Cultural Context: ${culturalContext || 'None'}

━━━ RULES (follow every one, no exceptions) ━━━
1. Every response MUST be exactly one tool call — either 'ask_questions' or 'generate_post'. Never output plain prose.

2. Read the user's message carefully. Do NOT ask for things that are obvious or already given.
   - "promotion post for a toy car" → product is known. Don't ask "what is the product?"
   - "itinerary for Varkala trip" → destination and purpose are obvious. Don't ask "what's the benefit?"
   Only ask if genuinely missing: target audience, tone/style, or CTA. Max 3 sharp, non-obvious questions in one 'ask_questions' call.
   If you already have enough, skip questions and go straight to 'generate_post'.

━━━ POST WRITING STANDARDS ━━━
When calling 'generate_post', write a LONG, DETAILED, high-quality post. Follow these platform-specific guidelines:

📘 LinkedIn (minimum 1500 characters):
   - Start with a bold hook (single punchy line or question)
   - Tell a story or share insights in 3–5 short paragraphs
   - Use line breaks generously for readability
   - Include a clear takeaway or lesson
   - End with a thought-provoking question or strong CTA
   - Emojis: minimal and strategic (1–3 max)

📸 Instagram (minimum 1000 characters):
   - Open with an attention-grabbing first line (emoji optional)
   - Use short punchy paragraphs (2–3 lines each)
   - Build up excitement, storytelling, or a list of benefits
   - Include a strong CTA before the hashtags
   - Drop 5–10 hashtags at the end separated by spaces
   - Emojis: expressive and frequent

🐦 Twitter/X (as long as platform allows, ideally a thread-style single post):
   - Lead with a bold statement or hot take
   - Pack maximum value in minimal words
   - Use line breaks between ideas
   - End with a hook question or CTA

🌐 General (minimum 1000 characters):
   - Write as if for LinkedIn — structured, thoughtful, detailed

For ALL platforms:
   - NEVER write a generic 2-line post. Always add texture: anecdotes, specific details, numbers, lists, or emotional resonance.
   - If cultural context is set, weave it naturally into the post (references, occasions, language nuances).
   - If language is not English, write the ENTIRE post in that language.`,
    // Stop after 5 steps to prevent infinite loops
    stopWhen: stepCountIs(5),
    tools: {
      // ask_questions has NO execute — it is a client-side tool.
      // The frontend renders the form and calls addToolOutput() with the user's answers,
      // which triggers the next agent step automatically.
      ask_questions: tool({
        description:
          'Ask the user one or more specific questions to gather details needed for the social media post. The UI will render a text input for each question.',
        inputSchema: z.object({
          questions: z.array(
            z.object({
              id: z.string().describe('Unique identifier for this question, e.g. "product_name"'),
              text: z.string().describe('The question to display to the user'),
              placeholder: z.string().optional().describe('Optional placeholder hint for the input field'),
            })
          ),
        }),
        // No execute() — this is a client-side tool. The frontend renders the form
        // and calls addToolOutput() with the user's answers, triggering the next step.
      }),

      generate_post: tool({
        description:
          'Generate a full-length, detailed, platform-optimised social media post with suggested hashtags. The post MUST follow the length and structure guidelines in your instructions — never write a short or generic post.',
        inputSchema: z.object({
          content: z.string().describe(
            'The complete social media post text. Must be long and detailed: minimum ~1200 characters for Instagram/LinkedIn/General, packed with storytelling, specific details, and structure (short paragraphs, line breaks, lists where suitable). Twitter/X can be shorter but still punchy and well-structured.'
          ),
          suggested_hashtags: z.array(z.string()).describe('Relevant hashtags without the # symbol'),
        }),
        execute: async (input: { content: string; suggested_hashtags: string[] }) => {
          console.log('[Tool Call: generate_post]', {
            contentLength: input.content.length,
            hashtagCount: input.suggested_hashtags.length,
            content: input.content.substring(0, 200) + '...',
            hashtags: input.suggested_hashtags,
          });

          // Score the generated content so the UI can show the engagement breakdown
          let scores = { hook_score: 0, clarity_score: 0, cta_score: 0, final_score: 0 };
          try {
            scores = await scoreContent(input.content, (platform || 'Instagram') as Platform);
            console.log('[Agent Scores]', scores);
          } catch (err) {
            console.error('[Agent Scoring Error]', err);
          }

          const post = {
            post_id: randomUUID(),
            content: input.content,
            suggested_hashtags: input.suggested_hashtags,
            platform: (platform || 'Instagram') as Platform,
            target_language: (targetLanguage || 'English') as IndicLanguage,
            cultural_context: (culturalContext || 'None') as CulturalContext,
            created_at: Date.now(),
            ...scores,
            // Only set user_id when we have a verified user
            ...(userId ? { user_id: userId } : {}),
          };

          // Persist post so /api/optimize can find it by post_id + user_id
          if (userId) {
            try {
              await dynamoDb.send(new PutCommand({ TableName: POSTS_TABLE, Item: post }));
              console.log('[Agent] Post saved to DynamoDB:', post.post_id);
            } catch (err) {
              console.error('[Agent] DynamoDB save error:', err);
            }
          }

          return post;
        },
      }),
    },
  });

  // createAgentUIStreamResponse returns the UIMessageChunk-formatted stream
  // that DefaultChatTransport in the frontend can parse via useChat().
  console.log('[Agent Response Stream Started]');
  return createAgentUIStreamResponse({ agent: agent as any, uiMessages: messages });
}

