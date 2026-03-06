'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { Platform, IndicLanguage, CulturalContext, Post } from '@/types/post';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import {
  Sparkles,
  Send,
  Loader2,
  Target,
  Check,
  RefreshCw,
  Hash,
  Copy,
  CheckCheck,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AgentUIProps {
  platform: Platform;
  targetLanguage: IndicLanguage;
  culturalContext: CulturalContext;
  onPostGenerated?: (post: Post) => void;
}

interface Question {
  id: string;
  text: string;
  placeholder?: string;
}

interface AnswerPayload {
  answers: Array<{ question: string; answer: string }>;
}

interface GeneratePostResult {
  post_id: string;
  content: string;
  suggested_hashtags: string[];
  platform?: string;
  target_language?: string;
  cultural_context?: string;
  created_at?: number;
}

// ── Helper: extract text from message parts ────────────────────────────────

function getTextFromParts(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text!)
    .join('')
    // Strip Claude's internal <thinking>...</thinking> blocks before rendering
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .trim();
}

// ── Main component ────────────────────────────────────────────────────────────

export function AgentUI({ platform, targetLanguage, culturalContext, onPostGenerated }: AgentUIProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // v6 useChat: configure via DefaultChatTransport (api + extra body fields)
  const { messages, status, addToolOutput, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agent',
      body: { platform, targetLanguage, culturalContext },
      // Pass auth token so the agent route can save the post to DynamoDB,
      // enabling the /api/optimize panel to find it afterwards.
      headers: () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('creo_token') : null;
        const authHeaders: Record<string, string> = {};

        if (token) {
          authHeaders.Authorization = `Bearer ${token}`;
        }
        return authHeaders;
      },
    }),
    // Required: tells useChat to automatically re-POST to the agent after
    // addToolOutput() is called. Without this, addToolOutput only updates
    // local state and the agent loop never continues.
    //
    // IMPORTANT: Only trigger re-send for 'ask_questions' completions.
    // If we check ALL tool parts (including 'generate_post'), then every time
    // the server streams generate_post output back, this fires again → infinite loop.
    sendAutomaticallyWhen: ({ messages: msgs }) => {
      const last = msgs[msgs.length - 1];
      if (!last || last.role !== 'assistant') return false;
      // If generate_post has already run, never re-send
      const hasGeneratePost = (last.parts as any[]).some((p) => p.type === 'tool-generate_post');
      if (hasGeneratePost) return false;
      // Re-send only when there are answered ask_questions parts
      const askParts = (last.parts as any[]).filter((p) => p.type === 'tool-ask_questions');
      if (askParts.length === 0) return false;
      return askParts.every((p: any) => p.state === 'output-available');
    },
    onFinish: ({ message }) => {
      // Tool part type is 'tool-{toolName}' in AI SDK v6
      const postPart = message.parts.find(
        (p: any) => p.type === 'tool-generate_post' && p.state === 'output-available'
      ) as any;
      if (postPart && onPostGenerated) {
        onPostGenerated(postPart.output as Post);
      }
    },
  });

  // isProcessing = AI is submitting or actively streaming
  const isProcessing = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom of the chat container (not the page viewport)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startAgent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!initialPrompt.trim()) return;
    setHasStarted(true);
    sendMessage({ text: initialPrompt });
    setInitialPrompt('');
  };

  const reset = () => {
    setMessages([]);
    setHasStarted(false);
    setInitialPrompt('');
  };

  // ── Initial prompt screen ──────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">Let AI Guide You</h3>
          <p className="text-gray-600">
            Tell me briefly what you want to post about, and I&apos;ll ask exactly what I need to make it perfect.
          </p>
        </div>

        <form onSubmit={startAgent} className="max-w-2xl mx-auto space-y-4">
          <Textarea
            value={initialPrompt}
            onChange={(e) => setInitialPrompt(e.target.value)}
            placeholder="e.g. I want to tell people about my new handmade pottery collection dropping this Friday..."
            rows={4}
            className="w-full resize-none text-base"
          />
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={!initialPrompt.trim() || isProcessing}
              size="lg"
              icon={<Sparkles className="w-5 h-5" />}
            >
              Start Creating
            </Button>
          </div>
        </form>
      </motion.div>
    );
  }

  // ── Agent conversation screen ──────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div ref={scrollContainerRef} className="bg-gray-50 rounded-2xl p-4 sm:p-6 min-h-105 max-h-155 overflow-y-auto shadow-inner border border-gray-100 space-y-6">
        {/* Spinner before first message arrives */}
        {messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        )}

        {messages.map((m) => {
          // v6: part.type is 'text' or 'tool-{toolName}'
          const textContent = getTextFromParts(m.parts as any);
          const toolParts = (m.parts as any[]).filter(
            (p) => p.type?.startsWith('tool-')
          );
          // If this assistant message contains a generate_post tool call,
          // suppress the text content — the model echoes the post as prose
          // AND via the tool, which would render it twice.
          const hasGeneratePost = toolParts.some((p: any) => p.type === 'tool-generate_post');

          return (
            <AnimatePresence key={m.id} mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* ── Text content (hidden when generate_post is present) ── */}
                {textContent && !hasGeneratePost && (
                  <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{textContent}</p>
                    </div>
                  </div>
                )}

                {/* ── Tool parts ── */}
                {toolParts.map((part: any) => {
                  // In AI SDK v6, part.type === 'tool-{toolName}'
                  const toolName = part.type?.replace(/^tool-/, '');
                  const { toolCallId, state, input, output } = part;

                  // ask_questions → interactive form (client-side, no execute)
                  if (toolName === 'ask_questions') {
                    const answered = state === 'output-available';
                    return (
                      <QuestionForm
                        key={toolCallId}
                        questions={(input?.questions ?? []) as Question[]}
                        answered={answered}
                        answeredData={answered ? (typeof output === 'string' ? JSON.parse(output) : output) as AnswerPayload : undefined}
                        onSubmit={(answers) =>
                          addToolOutput({
                            toolCallId,
                            tool: 'ask_questions', // Added required tool name
                            output: JSON.stringify({ answers }),
                          })
                        }
                      />
                    );
                  }

                  // generate_post → show generated post or a loading state
                  if (toolName === 'generate_post') {
                    if (state === 'output-available') {
                      return (
                        <GeneratedPostCard
                          key={toolCallId}
                          result={output as GeneratePostResult}
                        />
                      );
                    }
                    return (
                      <div key={toolCallId} className="flex justify-start">
                        <div className="bg-blue-50 border border-blue-100 text-blue-800 px-5 py-3 rounded-2xl flex items-center space-x-3">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span className="text-sm font-medium">Generating your final post…</span>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </motion.div>
            </AnimatePresence>
          );
        })}

        {/* Typing indicator while AI is processing */}
        {isProcessing && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm flex items-center space-x-2">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex justify-center">
        <Button variant="ghost" onClick={reset} icon={<RefreshCw className="w-4 h-4" />}>
          Start Over
        </Button>
      </div>
    </div>
  );
}

// ── QuestionForm sub-component ────────────────────────────────────────────────
// Rendered when the AI calls ask_questions (client-side tool — no server execute).
// Calls addToolOutput() on submission, which signals the agent to continue.

function QuestionForm({
  questions,
  answered,
  answeredData,
  onSubmit,
}: {
  questions: Question[];
  answered: boolean;
  answeredData?: AnswerPayload;
  onSubmit: (answers: Array<{ question: string; answer: string }>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      questions.map((q) => ({ question: q.text, answer: values[q.id] || '' }))
    );
  };

  // Build a lookup from question id → submitted answer for the answered state
  const answeredMap = Object.fromEntries(
    (answeredData?.answers ?? []).map((a) => [a.question, a.answer])
  );

  // ── Shared question list (used in both states) ──
  const questionList = (
    <div className="space-y-5">
      {questions.map((q, idx) => (
        <div key={q.id} className="space-y-1.5">
          <label className="flex items-start gap-2 text-sm font-medium text-gray-700">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 text-xs rounded-full shrink-0 mt-0.5">
              {idx + 1}
            </span>
            {q.text}
          </label>
          {answered ? (
            // Read-only answer bubble
            <p className="text-sm text-gray-800 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
              {answeredMap[q.text] || '—'}
            </p>
          ) : (
            <Textarea
              placeholder={q.placeholder || 'Type your answer here…'}
              value={values[q.id] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [q.id]: e.target.value }))}
              className="w-full"
              rows={2}
              required
            />
          )}
        </div>
      ))}
    </div>
  );

  // ── Active form ──
  return (
    <div className="flex justify-start">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[92%] bg-white border border-gray-200 shadow-lg shadow-gray-100/50 rounded-2xl p-6 space-y-5 relative overflow-hidden"
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />

        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-gray-700">
            <Target className="w-4 h-4 text-blue-500" />
            <h4 className="font-semibold text-gray-800">
              I need a few more details to make this perfect:
            </h4>
          </div>
          {!answered && (
            <p className="text-xs text-gray-500 pl-6">Fill in the fields below and hit Submit.</p>
          )}
        </div>

        {questionList}

        {/* Footer: show submitted badge OR the submit button */}
        <div className="flex items-center justify-end pt-2 border-t border-gray-100">
          {answered ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
              <Check className="w-4 h-4" /> Details Submitted
            </span>
          ) : (
            <Button type="submit" size="sm" icon={<Send className="w-4 h-4" />}>
              Submit Answers
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── GeneratedPostCard sub-component ──────────────────────────────────────────

function GeneratedPostCard({ result }: { result: GeneratePostResult }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="w-full bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 space-y-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="w-5 h-5" />
            <span className="font-semibold text-sm">Post Ready</span>
          </div>
          <button
            onClick={copy}
            className="flex items-center space-x-1.5 text-xs text-green-700 hover:text-green-900 transition-colors"
          >
            {copied ? (
              <><CheckCheck className="w-4 h-4" /><span>Copied!</span></>
            ) : (
              <><Copy className="w-4 h-4" /><span>Copy</span></>
            )}
          </button>
        </div>

        {/* Post content */}
        <div className="bg-white rounded-xl p-4 border border-green-100 shadow-inner">
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{result.content}</p>
        </div>

        {/* Hashtags */}
        {result.suggested_hashtags?.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1 text-xs text-green-600 font-medium">
              <Hash className="w-3.5 h-3.5" />
              <span>Suggested Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.suggested_hashtags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

