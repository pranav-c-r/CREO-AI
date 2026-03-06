/**
 * POST /api/conversation/generate
 * Handles conversational content generation
 */
import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';
import conversationalService from '@/services/conversationalService';
import { scoreContent } from '@/services/scoringService';
import { dynamoDb } from '@/lib/dynamoClient';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { Platform, IndicLanguage, CulturalContext } from '@/types/post';

const POSTS_TABLE = process.env.POSTS_TABLE!;

const VALID_PLATFORMS: Platform[] = ['Twitter', 'LinkedIn', 'Instagram'];
const VALID_LANGUAGES: IndicLanguage[] = ['English', 'Hindi', 'Marathi', 'Tamil', 'Bengali', 'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];
const VALID_CULTURAL_CONTEXTS: CulturalContext[] = [
  'Diwali', 'Holi', 'Eid', 'Christmas', 'Pongal', 'Onam', 'Durga Puja', 'Ganesh Chaturthi', 'Navratri',
  'IPL Season', 'Cricket World Cup', 'Monsoon', 'Summer', 'Winter', 'Wedding Season', 'Festival Season',
  'Independence Day', 'Republic Day', 'New Year', 'None'
];

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    conversation_id, 
    platform, 
    target_language, 
    cultural_context,
    user_input 
  } = req.body as {
    conversation_id?: string;
    platform?: string;
    target_language?: string;
    cultural_context?: string;
    user_input?: string;
  };

  // Input validation
  if (!platform || !VALID_PLATFORMS.includes(platform as Platform)) {
    return res.status(400).json({ error: `platform must be one of: ${VALID_PLATFORMS.join(', ')}` });
  }
  if (!target_language || !VALID_LANGUAGES.includes(target_language as IndicLanguage)) {
    return res.status(400).json({ error: `target_language must be one of: ${VALID_LANGUAGES.join(', ')}` });
  }
  if (cultural_context && !VALID_CULTURAL_CONTEXTS.includes(cultural_context as CulturalContext)) {
    return res.status(400).json({ error: `cultural_context must be one of: ${VALID_CULTURAL_CONTEXTS.join(', ')}` });
  }

  try {
    const typedPlatform = platform as Platform;
    const typedLanguage = target_language as IndicLanguage;
    const typedCulturalContext = (cultural_context || 'None') as CulturalContext;
    const userId = req.userId;

    let conversationId = conversation_id;

    // Start new conversation if needed
    if (!conversationId && user_input) {
      const newConversationId = randomUUID();
      const conversation = conversationalService.startConversation(user_input, newConversationId);
      conversationId = newConversationId;
      
      return res.status(200).json({
        conversation_id: newConversationId,
        conversation_state: conversation,
        current_question: conversationalService.getCurrentQuestion(newConversationId),
        progress: conversationalService.getProgress(newConversationId),
        is_new: true
      });
    }

    if (!conversationId) {
      return res.status(400).json({ error: 'conversation_id is required' });
    }

    // Get current conversation state
    const conversation = conversationalService.getAnswers(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Generate content from conversation
    const generated = await conversationalService.generateContentFromConversation(
      conversationId,
      typedPlatform,
      typedLanguage,
      typedCulturalContext
    );

    // Score the generated content
    const scores = await scoreContent(generated.content, typedPlatform);

    // Build the post record
    const post = {
      user_id: userId,
      created_at: Date.now(),
      post_id: randomUUID(),
      content: generated.content,
      platform: typedPlatform,
      target_language: typedLanguage,
      cultural_context: typedCulturalContext,
      idea: 'Generated through conversation',
      suggested_hashtags: generated.suggested_hashtags,
      conversation_answers: conversation,
      ...scores,
    };

    // Persist to DynamoDB
    await dynamoDb.send(
      new PutCommand({
        TableName: POSTS_TABLE,
        Item: post,
      })
    );

    return res.status(200).json(post);
  } catch (error) {
    console.error('[/api/conversation/generate] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: message });
  }
}

export default withAuth(handler);
