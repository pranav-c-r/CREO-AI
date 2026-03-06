'use client';

/**
 * Create Page — Modern AI Content Generation with Enhanced UI/UX
 * Features: Smooth animations, modern components, improved visual hierarchy
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Post, OptimizationResult, IndicLanguage, CulturalContext } from '@/types/post';
import { ConversationState, ConversationQuestion } from '@/types/conversation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ConversationalFlow,
  ConversationStarter
} from '@/components/ConversationalUI';
import { AgentUI } from '@/components/AgentUI';
import {
  PenTool,
  Image,
  Upload,
  Sparkles,
  TrendingUp,
  Target,
  Hash,
  Download,
  X,
  Check,
  Loader2
} from 'lucide-react';

type Platform = 'Twitter' | 'LinkedIn' | 'Instagram';

const PLATFORMS: Platform[] = ['Twitter', 'LinkedIn', 'Instagram'];

const PLATFORM_META: Record<Platform, { icon: string; desc: string }> = {
  Twitter: { icon: '𝕏', desc: 'Up to 280 chars' },
  LinkedIn: { icon: 'in', desc: 'Professional' },
  Instagram: { icon: '📸', desc: 'Visual & casual' },
};

const LANGUAGES: IndicLanguage[] = [
  'English', 'Hindi', 'Marathi', 'Tamil', 'Bengali',
  'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
];

const LANGUAGE_META: Record<IndicLanguage, { code: string; native: string }> = {
  English: { code: 'EN', native: 'English' },
  Hindi: { code: 'हिं', native: 'हिन्दी' },
  Marathi: { code: 'मर', native: 'मराठी' },
  Tamil: { code: 'த', native: 'தமிழ்' },
  Bengali: { code: 'বা', native: 'বাংলা' },
  Telugu: { code: 'తె', native: 'తెలుగు' },
  Gujarati: { code: 'ગુ', native: 'ગુજરાતી' },
  Kannada: { code: 'ಕ', native: 'ಕನ್ನಡ' },
  Malayalam: { code: 'മ', native: 'മലയാളം' },
  Punjabi: { code: 'ਪ', native: 'ਪੰਜਾਬੀ' },
};

const CULTURAL_CONTEXTS: CulturalContext[] = [
  'None', 'Diwali', 'Holi', 'Eid', 'Christmas', 'Pongal', 'Onam', 'Durga Puja', 'Ganesh Chaturthi', 'Navratri',
  'IPL Season', 'Cricket World Cup', 'Monsoon', 'Summer', 'Winter', 'Wedding Season', 'Festival Season',
  'Independence Day', 'Republic Day', 'New Year'
];

const CULTURAL_CONTEXT_META: Record<CulturalContext, { icon: string; desc: string; color: string }> = {
  'None': { icon: '🌐', desc: 'No specific cultural context', color: 'gray' },
  'Diwali': { icon: '🪔', desc: 'Festival of lights', color: 'orange' },
  'Holi': { icon: '🎨', desc: 'Festival of colors', color: 'pink' },
  'Eid': { icon: '🌙', desc: 'Festival of celebration', color: 'purple' },
  'Christmas': { icon: '🎄', desc: 'Holiday season', color: 'red' },
  'Pongal': { icon: '🌾', desc: 'Harvest festival', color: 'yellow' },
  'Onam': { icon: '🌺', desc: 'Harvest celebration', color: 'pink' },
  'Durga Puja': { icon: '🙏', desc: 'Festival of worship', color: 'orange' },
  'Ganesh Chaturthi': { icon: '🐘', desc: 'Festival of beginnings', color: 'yellow' },
  'Navratri': { icon: '🔥', desc: 'Nine nights celebration', color: 'red' },
  'IPL Season': { icon: '🏏', desc: 'Cricket tournament', color: 'blue' },
  'Cricket World Cup': { icon: '🏆', desc: 'Global cricket event', color: 'blue' },
  'Monsoon': { icon: '🌧️', desc: 'Rainy season', color: 'blue' },
  'Summer': { icon: '☀️', desc: 'Hot season', color: 'yellow' },
  'Winter': { icon: '❄️', desc: 'Cold season', color: 'blue' },
  'Wedding Season': { icon: '💒', desc: 'Marriage celebrations', color: 'pink' },
  'Festival Season': { icon: '🎉', desc: 'General celebration time', color: 'orange' },
  'Independence Day': { icon: '🇮🇳', desc: 'National celebration', color: 'orange' },
  'Republic Day': { icon: '🇮🇳', desc: 'National day', color: 'orange' },
  'New Year': { icon: '🎊', desc: 'New beginnings', color: 'blue' },
};

/* ── Copy Button Component ── */
function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      className={`p-2 rounded-xl bg-white shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center gap-2 text-gray-500 hover:text-blue-600 ${className}`}
      title="Copy to clipboard"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="copied"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold text-green-600">Copied!</span>
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Copy</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Score Bar Component ── */
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{score}/100</span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full shadow-sm"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
      </div>
    </div>
  );
}

/* ── Optimization Result Card ── */
function OptimizationCard({
  result,
  type,
  onClose,
}: {
  result: OptimizationResult;
  type: string;
  onClose: () => void;
}) {
  const improvement = result.improvement_percentage;
  const improved = improvement > 0;

  return (
    <div className="card p-6" style={{ borderLeft: '4px solid #14b8a6' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 capitalize">{type} Optimization Result</h3>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1.5 inline-block"
            style={improved
              ? { background: 'rgba(20,184,166,0.12)', color: '#0f766e', border: '1px solid rgba(20,184,166,0.2)' }
              : { background: '#f1f5f9', color: '#64748b' }
            }
          >
            {improved ? `+${improvement}% improvement` : 'No improvement'}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Before */}
        <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p className="text-xs font-bold text-slate-500 mb-2 tracking-wider">BEFORE</p>
          <p className="text-sm text-slate-700 leading-relaxed">{result.original_content}</p>
          <div className="mt-3 text-xs text-slate-400">Score: {result.original_score.final_score}/100</div>
        </div>
        {/* After */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.15)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-teal-600 tracking-wider">AFTER</p>
            <CopyButton text={result.improved_content} />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{result.improved_content}</p>
          <div className="mt-3 text-xs" style={{ color: '#14b8a6' }}>Score: {result.improved_score.final_score}/100</div>
        </div>
      </div>

      {result.suggested_hashtags && result.suggested_hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.suggested_hashtags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(20,184,166,0.08)', color: '#0f766e', border: '1px solid rgba(20,184,166,0.18)' }}>
              #{tag.replace(/^#/, '')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Create Page ── */
export default function CreatePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'simple' | 'conversational' | 'agent'>('simple');
  const [idea, setIdea] = useState('');
  const [platform, setPlatform] = useState<Platform>('LinkedIn');
  const [targetLanguage, setTargetLanguage] = useState<IndicLanguage>('English');
  const [culturalContext, setCulturalContext] = useState<CulturalContext>('None');

  // Agent Mode has its own isolated selectors so Quick Mode settings don't leak in
  const [agentPlatform, setAgentPlatform] = useState<Platform>('Instagram');
  const [agentTargetLanguage, setAgentTargetLanguage] = useState<IndicLanguage>('English');
  const [agentCulturalContext, setAgentCulturalContext] = useState<CulturalContext>('None');
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [activeOptType, setActiveOptType] = useState<string>('');
  const [error, setError] = useState('');

  // Conversational mode state
  const [conversationId, setConversationId] = useState<string>('');
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ConversationQuestion | null>(null);
  const [conversationProgress, setConversationProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [isConversationLoading, setIsConversationLoading] = useState(false);

  // Image Generation State
  const [imageMode, setImageMode] = useState<'none' | 'generate' | 'modify'>('none');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setUploadedImagePreview(URL.createObjectURL(file));
    }
  };

  // FIX: Guard localStorage access for SSR safety
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('creo_token');
    if (!token) {
      router.push('/login');
      return null;
    }
    return token;
  };

  // Conversational mode handlers
  const startConversation = async (flowId: string, userInput?: string) => {
    const token = getToken();
    if (!token) return;

    setIsConversationLoading(true);
    setError('');

    try {
      const res = await fetch('/api/conversation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_input: userInput || flowId,
          platform,
          target_language: targetLanguage,
          cultural_context: culturalContext
        }),
      });

      if (res.status === 401) { router.push('/login'); return; }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start conversation');

      setConversationId(data.conversation_id);
      setConversationState(data.conversation_state);
      setCurrentQuestion(data.current_question);
      setConversationProgress(data.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setIsConversationLoading(false);
    }
  };

  const submitConversationAnswer = async (answer: any) => {
    const token = getToken();
    if (!token || !conversationId) return;

    setIsConversationLoading(true);
    setError('');

    try {
      const res = await fetch('/api/conversation/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          answer,
          action: 'submit'
        }),
      });

      if (res.status === 401) { router.push('/login'); return; }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit answer');

      setConversationState(data.conversation_state);
      setCurrentQuestion(data.current_question);
      setConversationProgress(data.progress);

      if (data.is_completed) {
        await generateFromConversation();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsConversationLoading(false);
    }
  };

  const goBackInConversation = async () => {
    const token = getToken();
    if (!token || !conversationId) return;

    setIsConversationLoading(true);

    try {
      const res = await fetch('/api/conversation/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          action: 'back'
        }),
      });

      if (res.status === 401) { router.push('/login'); return; }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to go back');

      setConversationState(data.conversation_state);
      setCurrentQuestion(data.current_question);
      setConversationProgress(data.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to go back');
    } finally {
      setIsConversationLoading(false);
    }
  };

  const resetConversation = async () => {
    const token = getToken();
    if (!token || !conversationId) return;

    try {
      await fetch('/api/conversation/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          action: 'reset'
        }),
      });
    } catch (err) {
      console.error('Failed to reset conversation:', err);
    }

    setConversationId('');
    setConversationState(null);
    setCurrentQuestion(null);
    setConversationProgress({ current: 0, total: 0, percentage: 0 });
  };

  // FIX: Removed user_input from the body — only conversation_id is needed when resuming
  const generateFromConversation = async () => {
    const token = getToken();
    if (!token || !conversationId) return;

    setIsConversationLoading(true);
    setError('');

    try {
      const res = await fetch('/api/conversation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          platform,
          target_language: targetLanguage,
          cultural_context: culturalContext
        }),
      });

      if (res.status === 401) { router.push('/login'); return; }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate content');

      setPost(data);
      await resetConversation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsConversationLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    const token = getToken();
    if (!token) return;

    setGenerating(true);
    setError('');
    setPost(null);
    setOptimizationResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idea, platform, target_language: targetLanguage, cultural_context: culturalContext }),
      });

      if (res.status === 401) { router.push('/login'); return; }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setPost(data);

      if (imageMode !== 'none') {
        setGeneratingImage(true);
        try {
          let base64 = '';
          if (imageMode === 'modify' && uploadedImage) {
            base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(uploadedImage);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (error) => reject(error);
            });
          }

          const imageRes = await fetch('/api/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              post_id: data.post_id,
              created_at: data.created_at,
              mode: imageMode,
              prompt: imageMode === 'generate' ? data.content : imagePrompt,
              image_base64: base64 || undefined,
            }),
          });

          if (imageRes.status === 401) { router.push('/login'); return; }

          const imageData = await imageRes.json();
          if (!imageRes.ok) throw new Error(imageData.error || 'Image generation failed');

          setPost(prev => prev ? { ...prev, image_url: imageData.image_url } : null);
        } catch (imgErr) {
          console.error(imgErr);
          setError(imgErr instanceof Error ? imgErr.message : 'Image generation failed');
        } finally {
          setGeneratingImage(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const handleOptimize = async (type: 'hook' | 'cta' | 'hashtags') => {
    if (!post) return;
    const token = getToken();
    if (!token) return;

    setOptimizing(type);
    setError('');
    setOptimizationResult(null);
    setActiveOptType(type);

    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: post.post_id, optimization_type: type }),
      });

      if (res.status === 401) { router.push('/login'); return; }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Optimization failed');

      setOptimizationResult(data);
      // Update the engagement score breakdown to reflect the optimized scores
      setPost((prev) =>
        prev
          ? {
              ...prev,
              hook_score: data.improved_score.hook_score,
              clarity_score: data.improved_score.clarity_score,
              cta_score: data.improved_score.cta_score,
              final_score: data.improved_score.final_score,
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed');
    } finally {
      setOptimizing(null);
    }
  };

  const scoreColors: Record<string, string> = {
    hook_score:    '#f59e0b',
    clarity_score: '#14b8a6',
    cta_score:     '#a855f7',
    final_score:   '#0d9488',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Page header */}
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create{' '}
            <span style={{ background: 'linear-gradient(135deg, #14b8a6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Content</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1.5">Generate, score, and optimize your social media posts with AI</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(20,184,166,0.1)', backdropFilter: 'blur(8px)' }}>
          <span className="text-sm font-semibold text-slate-600">Experience:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('simple')}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={mode === 'simple'
                ? { background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: 'white', boxShadow: '0 4px 14px rgba(20,184,166,0.35)' }
                : { background: 'white', color: '#475569', border: '1px solid #e2e8f0' }
              }
            >
              ⚡ Quick Mode
            </button>
            <button
              onClick={() => setMode('conversational')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'conversational'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              Old Guided Mode
            </button>
            <button
              onClick={() => setMode('agent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'agent'
                  ? 'bg-blue-600 text-white shadow-md order-none'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Agent Mode
            </button>
          </div>
          <div className="text-xs text-gray-500 ml-auto">
            {mode === 'simple'
              ? 'Perfect for quick content creation'
              : mode === 'agent' 
                ? 'Interactive AI assistant to build your post'
                : 'Legacy detailed content flow'
            }
          </div>
        </div>
      </motion.div>

      {/* ── Conversational Mode ── */}
      {mode === 'conversational' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 sm:p-8">
            {/* Platform and Language Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Platform selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Platform</label>
                <div className="grid grid-cols-1 gap-3">
                  {PLATFORMS.map((p) => (
                    <motion.button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className="relative p-3 rounded-xl border-2 transition-all duration-200"
                      style={platform === p
                        ? { background: 'rgba(20,184,166,0.06)', borderColor: '#14b8a6', boxShadow: '0 4px 12px rgba(20,184,166,0.15)' }
                        : { background: 'white', borderColor: '#e2e8f0' }
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-left">
                        <p className="font-semibold text-sm" style={{ color: platform === p ? '#0f766e' : '#475569' }}>
                          {p}
                        </p>
                        <p className="text-xs" style={{ color: platform === p ? '#14b8a6' : '#94a3b8' }}>
                          {PLATFORM_META[p].desc}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Language and Cultural Context */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value as IndicLanguage)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {LANGUAGE_META[lang].native}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cultural Context</label>
                  <select
                    value={culturalContext}
                    onChange={(e) => setCulturalContext(e.target.value as CulturalContext)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    {CULTURAL_CONTEXTS.map((context) => (
                      <option key={context} value={context}>
                        {CULTURAL_CONTEXT_META[context].icon} {context}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Conversational Flow */}
            {!conversationState ? (
              <ConversationStarter
                onStart={(flowId) => startConversation(flowId)}
                isLoading={isConversationLoading}
              />
            ) : (
              <ConversationalFlow
                conversation={conversationState}
                onAnswer={submitConversationAnswer}
                onNext={() => {}}
                onBack={goBackInConversation}
                onReset={resetConversation}
                isLoading={isConversationLoading}
                currentQuestion={currentQuestion}
                progress={conversationProgress}
              />
            )}

            {error && (
              <motion.div
                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      )}

      {/* ── Agent Mode ── */}
      {mode === 'agent' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 sm:p-8 space-y-6">
            {/* Agent-mode platform / language selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Platform */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                <div className="flex gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setAgentPlatform(p)}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                        agentPlatform === p
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-base">{PLATFORM_META[p].icon}</span>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                <select
                  value={agentTargetLanguage}
                  onChange={(e) => setAgentTargetLanguage(e.target.value as IndicLanguage)}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-blue-400 focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{LANGUAGE_META[l].native} ({l})</option>
                  ))}
                </select>
              </div>

              {/* Cultural Context */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cultural Context</label>
                <select
                  value={agentCulturalContext}
                  onChange={(e) => setAgentCulturalContext(e.target.value as CulturalContext)}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-blue-400 focus:outline-none"
                >
                  {CULTURAL_CONTEXTS.map((c) => (
                    <option key={c} value={c}>{CULTURAL_CONTEXT_META[c].icon} {c}</option>
                  ))}
                </select>
              </div>
            </div>

            <AgentUI 
              platform={agentPlatform}
              targetLanguage={agentTargetLanguage}
              culturalContext={agentCulturalContext}
              onPostGenerated={(newPost) => setPost(newPost)}
            />
          </Card>
        </motion.div>
      )}

      {/* ── Simple Mode ── */}
      {mode === 'simple' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 sm:p-8 space-y-6 sm:space-y-8">
            {/* Platform selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 sm:mb-4">Platform</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {PLATFORMS.map((p) => (
                  <motion.button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className="relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200"
                    style={platform === p
                      ? { background: 'rgba(20,184,166,0.06)', borderColor: '#14b8a6', boxShadow: '0 4px 14px rgba(20,184,166,0.15)' }
                      : { background: 'white', borderColor: '#e2e8f0' }
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center space-y-2">
                      <span className="text-xl sm:text-2xl">{PLATFORM_META[p].icon}</span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: platform === p ? '#0f766e' : '#475569' }}>
                          {p}
                        </p>
                        <p className="text-xs" style={{ color: platform === p ? '#14b8a6' : '#94a3b8' }}>
                          {PLATFORM_META[p].desc}
                        </p>
                      </div>
                    </div>
                    {platform === p && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ border: '2px solid #14b8a6' }}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Language selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 sm:mb-4">Target Language</label>
              <div className="relative">
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value as IndicLanguage)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none cursor-pointer hover:border-teal-300 transition-all"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {LANGUAGE_META[lang].native} ({lang})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Generate content in {targetLanguage === 'English' ? 'English' : LANGUAGE_META[targetLanguage].native}
              </p>
            </div>

            {/* Cultural Context selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 sm:mb-4">Cultural Context (Optional)</label>
              <div className="relative">
                <select
                  value={culturalContext}
                  onChange={(e) => setCulturalContext(e.target.value as CulturalContext)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none cursor-pointer hover:border-teal-300 transition-all"
                >
                  {CULTURAL_CONTEXTS.map((context) => (
                    <option key={context} value={context}>
                      {CULTURAL_CONTEXT_META[context].icon} {context} - {CULTURAL_CONTEXT_META[context].desc}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {culturalContext === 'None'
                  ? 'Add cultural flavor to make your content more relatable to Indian audiences'
                  : `Content will include ${CULTURAL_CONTEXT_META[culturalContext].desc} themes and references`
                }
              </p>
            </div>

            {/* Idea textarea */}
            <div>
              <label htmlFor="idea" className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-4">
                Your content idea
              </label>
              <Textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={4}
                placeholder={`Describe your post idea for ${platform} in ${targetLanguage === 'English' ? 'English' : LANGUAGE_META[targetLanguage].native}...\ne.g. "Tips for remote developers to stay productive"`}
                className="resize-none"
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                <p className="text-xs text-gray-400">{idea.length} characters</p>
                {idea.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      idea.length < 50 ? 'bg-red-500' :
                      idea.length < 100 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-xs text-gray-500">
                      {idea.length < 50 ? 'Too short' :
                       idea.length < 100 ? 'Good length' : 'Great detail'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Visuals Section */}
            <div className="pt-6 border-t border-gray-100">
              <label className="block text-sm font-semibold text-slate-700 mb-4">Visuals</label>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { mode: 'none' as const, label: 'No Image', icon: <X className="w-4 h-4" /> },
                  { mode: 'generate' as const, label: 'AI Generate', icon: <Sparkles className="w-4 h-4" /> },
                  { mode: 'modify' as const, label: 'Upload & Modify', icon: <Upload className="w-4 h-4" /> }
                ].map(({ mode: imgMode, label, icon }) => (
                  <motion.button
                    key={imgMode}
                    onClick={() => setImageMode(imgMode)}
                    className="p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2"
                    style={imageMode === imgMode
                      ? { background: 'rgba(20,184,166,0.08)', borderColor: '#14b8a6', color: '#0f766e' }
                      : { background: 'white', borderColor: '#e2e8f0', color: '#64748b' }
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {icon}
                    <span className="text-xs font-semibold">{label}</span>
                  </motion.button>
                ))}
              </div>

              {imageMode === 'modify' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-teal-300 transition-colors relative">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {uploadedImagePreview ? (
                      <div className="flex flex-col items-center space-y-3">
                        <img src={uploadedImagePreview} alt="Preview" className="h-32 w-auto rounded-xl shadow-sm" />
                        <span className="text-sm text-gray-500">Click to change image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 space-y-3">
                        <Upload className="w-12 h-12" />
                        <div>
                          <span className="text-base font-medium">Click to upload reference image</span>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="How should AI modify this image? (e.g. 'remove background', 'make it snowy')"
                  />
                </div>
              )}
              {imageMode === 'generate' && (
                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(168,85,247,0.06))', border: '1px solid rgba(20,184,166,0.2)' }}>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    <p className="text-sm font-medium text-teal-700">An AI image will be generated automatically based on your post idea.</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <motion.div
                className="p-4 bg-red-50 border border-red-200 rounded-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={generating || !idea.trim()}
              loading={generating}
              size="lg"
              icon={<Sparkles className="w-5 h-5" />}
              className="w-full shadow-lg hover:shadow-xl"
            >
              {generating ? 'Generating with AI...' : 'Generate Content'}
            </Button>
          </Card>
        </motion.div>
      )}

      {/* ── Generated content + Scores (shown after either mode produces a post) ── */}
      {post && (
        <>
          <div className="card p-6 space-y-5">
            {/* Content header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Generated Content</h2>
              <div className="flex items-center gap-2">
                <CopyButton text={post.content} />
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(20,184,166,0.1)', color: '#0f766e', border: '1px solid rgba(20,184,166,0.2)' }}>
                  {post.platform}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.1)', color: '#7e22ce', border: '1px solid rgba(168,85,247,0.2)' }}>
                  {LANGUAGE_META[post.target_language].code}
                </span>
                {post.cultural_context && post.cultural_context !== 'None' && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1" style={{ background: 'rgba(245,158,11,0.1)', color: '#b45309', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {CULTURAL_CONTEXT_META[post.cultural_context].icon} {post.cultural_context}
                  </span>
                )}
              </div>
            </div>

            {/* Content text and image */}
            <div className="space-y-4">
              {post.image_url && (
                <div className="relative group w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                  <img src={post.image_url} alt="Generated post visual" className="w-full h-auto object-cover max-h-96" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end justify-end p-3">
                    <a
                      href={post.image_url}
                      download="creo-ai-visual.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                    </svg>
                    AI Generated
                  </div>
                </div>
              )}
              {generatingImage && (
                <div className="w-full h-64 rounded-xl flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.06), rgba(168,85,247,0.05))', border: '1px solid rgba(20,184,166,0.15)' }}>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg">🎨</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-teal-700">Generating image with Nova Canvas...</span>
                  <span className="text-xs text-teal-400">This may take 10–20 seconds</span>
                </div>
              )}
              <div className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ background: 'rgba(248,250,251,0.8)', color: '#334155', border: '1px solid rgba(0,0,0,0.05)' }}>
                {post.content}
              </div>
            </div>

            {/* Hashtags */}
            {post.suggested_hashtags && post.suggested_hashtags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Suggested Hashtags</p>
                <div className="flex flex-wrap gap-1.5">
                  {post.suggested_hashtags.map((tag: string) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(20,184,166,0.08)', color: '#0f766e', border: '1px solid rgba(20,184,166,0.18)' }}>
                      #{tag.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Score breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Engagement Score Breakdown</h3>
                <span className="text-2xl font-extrabold" style={{ background: 'linear-gradient(135deg, #14b8a6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {post.final_score}<span className="text-sm font-normal text-slate-400" style={{ WebkitTextFillColor: '#94a3b8' }}>/100</span>
                </span>
              </div>
              <div className="space-y-3">
                <ScoreBar label="Hook Strength" score={post.hook_score} color={scoreColors.hook_score} />
                <ScoreBar label="Clarity" score={post.clarity_score} color={scoreColors.clarity_score} />
                <ScoreBar label="Call-to-Action" score={post.cta_score} color={scoreColors.cta_score} />
                <ScoreBar label="Overall Score" score={post.final_score} color={scoreColors.final_score} />
              </div>
            </div>
          </div>

          {/* Optimization Panel */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-slate-800 mb-1">Optimization Panel</h2>
            <p className="text-xs text-slate-400 font-medium mb-5">AI will rewrite and re-score your content</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'hook' as const, label: 'Improve Hook', icon: '🎣', desc: 'Stronger opening' },
                { type: 'cta' as const, label: 'Improve CTA', icon: '📢', desc: 'Better call-to-action' },
                { type: 'hashtags' as const, label: 'Suggest Hashtags', icon: '#️⃣', desc: 'Optimized tags' },
              ].map(({ type, label, icon, desc }) => (
                <button
                  key={type}
                  id={`optimize-${type}`}
                  onClick={() => handleOptimize(type)}
                  disabled={!!optimizing}
                  className="flex flex-col items-center p-4 rounded-xl transition-all group gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ border: '1.5px solid #e2e8f0' }}
                  onMouseEnter={e => { if (!optimizing) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#14b8a6'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(20,184,166,0.05)'; } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.background = ''; }}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition-colors">
                    {optimizing === type ? 'Optimizing...' : label}
                  </span>
                  <span className="text-xs text-slate-400">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optimization Result */}
          {optimizationResult && (
            <OptimizationCard
              result={optimizationResult}
              type={activeOptType}
              onClose={() => setOptimizationResult(null)}
            />
          )}
        </>
      )}
    </div>
  );
}