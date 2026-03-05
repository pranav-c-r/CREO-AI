'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
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
  Loader2,
  Zap,
  Feather,
  Brain,
  Globe2,
  Palette,
  Mic,
  Settings2,
  ArrowRight,
  Copy,
  CheckCircle2,
  Volume2,
  Eye,
  BarChart3,
  Award,
  Stars,
  Rocket,
  Wand2
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const gradientMove = {
  initial: { backgroundPosition: "0% 50%" },
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

type Platform = 'Twitter' | 'LinkedIn' | 'Instagram';

const PLATFORMS: Platform[] = ['Twitter', 'LinkedIn', 'Instagram'];

const PLATFORM_META: Record<Platform, { icon: string; desc: string; gradient: string; color: string }> = {
  Twitter: { 
    icon: '𝕏', 
    desc: 'Up to 280 chars',
    gradient: 'from-blue-400 to-cyan-400',
    color: 'blue'
  },
  LinkedIn: { 
    icon: 'in', 
    desc: 'Professional',
    gradient: 'from-blue-600 to-blue-800',
    color: 'blue'
  },
  Instagram: { 
    icon: '📸', 
    desc: 'Visual & casual',
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
    color: 'purple'
  },
};

const LANGUAGES: IndicLanguage[] = [
  'English', 'Hindi', 'Marathi', 'Tamil', 'Bengali',
  'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
];

const LANGUAGE_META: Record<IndicLanguage, { code: string; native: string; flag: string }> = {
  English: { code: 'EN', native: 'English', flag: '🇬🇧' },
  Hindi: { code: 'हिं', native: 'हिन्दी', flag: '🇮🇳' },
  Marathi: { code: 'मर', native: 'मराठी', flag: '🇮🇳' },
  Tamil: { code: 'த', native: 'தமிழ்', flag: '🇮🇳' },
  Bengali: { code: 'বা', native: 'বাংলা', flag: '🇮🇳' },
  Telugu: { code: 'తె', native: 'తెలుగు', flag: '🇮🇳' },
  Gujarati: { code: 'ગુ', native: 'ગુજરાતી', flag: '🇮🇳' },
  Kannada: { code: 'ಕ', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  Malayalam: { code: 'മ', native: 'മലയാളം', flag: '🇮🇳' },
  Punjabi: { code: 'ਪ', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
};

const CULTURAL_CONTEXTS: CulturalContext[] = [
  'None', 'Diwali', 'Holi', 'Eid', 'Christmas', 'Pongal', 'Onam', 'Durga Puja', 'Ganesh Chaturthi', 'Navratri',
  'IPL Season', 'Cricket World Cup', 'Monsoon', 'Summer', 'Winter', 'Wedding Season', 'Festival Season',
  'Independence Day', 'Republic Day', 'New Year'
];

const CULTURAL_CONTEXT_META: Record<CulturalContext, { icon: string; desc: string; gradient: string }> = {
  'None': { icon: '🌐', desc: 'No specific cultural context', gradient: 'from-gray-400 to-gray-500' },
  'Diwali': { icon: '🪔', desc: 'Festival of lights', gradient: 'from-orange-400 to-yellow-500' },
  'Holi': { icon: '🎨', desc: 'Festival of colors', gradient: 'from-pink-500 via-purple-500 to-blue-500' },
  'Eid': { icon: '🌙', desc: 'Festival of celebration', gradient: 'from-emerald-400 to-green-600' },
  'Christmas': { icon: '🎄', desc: 'Holiday season', gradient: 'from-red-500 to-green-500' },
  'Pongal': { icon: '🌾', desc: 'Harvest festival', gradient: 'from-yellow-400 to-orange-500' },
  'Onam': { icon: '🌺', desc: 'Harvest celebration', gradient: 'from-pink-400 to-red-500' },
  'Durga Puja': { icon: '🙏', desc: 'Festival of worship', gradient: 'from-orange-500 to-red-600' },
  'Ganesh Chaturthi': { icon: '🐘', desc: 'Festival of beginnings', gradient: 'from-yellow-400 to-orange-400' },
  'Navratri': { icon: '🔥', desc: 'Nine nights celebration', gradient: 'from-red-500 to-purple-600' },
  'IPL Season': { icon: '🏏', desc: 'Cricket tournament', gradient: 'from-blue-500 to-cyan-500' },
  'Cricket World Cup': { icon: '🏆', desc: 'Global cricket event', gradient: 'from-blue-600 to-indigo-600' },
  'Monsoon': { icon: '🌧️', desc: 'Rainy season', gradient: 'from-blue-400 to-slate-500' },
  'Summer': { icon: '☀️', desc: 'Hot season', gradient: 'from-yellow-400 to-orange-500' },
  'Winter': { icon: '❄️', desc: 'Cold season', gradient: 'from-cyan-400 to-blue-400' },
  'Wedding Season': { icon: '💒', desc: 'Marriage celebrations', gradient: 'from-pink-400 to-rose-500' },
  'Festival Season': { icon: '🎉', desc: 'General celebration time', gradient: 'from-purple-400 to-pink-500' },
  'Independence Day': { icon: '🇮🇳', desc: 'National celebration', gradient: 'from-orange-500 to-green-500' },
  'Republic Day': { icon: '🇮🇳', desc: 'National day', gradient: 'from-orange-500 to-green-500' },
  'New Year': { icon: '🎊', desc: 'New beginnings', gradient: 'from-blue-400 to-purple-500' },
};

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
      className={`relative overflow-hidden group p-2.5 rounded-xl bg-gradient-to-r from-white to-gray-50 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={copied ? { scale: [1, 1.5, 1], opacity: [0, 0.3, 0] } : {}}
      />
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="copied"
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Copied!
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Copy</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function ScoreBar({ label, score, color, icon: Icon }: { label: string; score: number; color: string; icon?: any }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ type: "spring", stiffness: 100, damping: 12 }}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" style={{ color }} />}
          {label}
        </span>
        <motion.span
          className="text-sm font-bold"
          style={{ color }}
          initial={{ scale: 0 }}
          animate={isVisible ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          {score}/100
        </motion.span>
      </div>
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${color}40, ${color})`,
            width: isVisible ? `${score}%` : '0%'
          }}
          initial={{ width: 0 }}
          animate={isVisible ? { width: `${score}%` } : {}}
          transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
        />
      </div>
    </motion.div>
  );
}

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent capitalize">
              {type} Optimization
            </h3>
            <motion.span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                improved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              {improved ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  +{improvement}% improvement
                </>
              ) : (
                'No improvement needed'
              )}
            </motion.span>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            className="bg-gray-50 rounded-xl p-5 border border-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              ORIGINAL
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{result.original_content}</p>
            <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
              <BarChart3 className="w-3 h-3" />
              Score: {result.original_score.final_score}/100
            </div>
          </motion.div>
          
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-blue-600 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                OPTIMIZED
              </p>
              <CopyButton text={result.improved_content} />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{result.improved_content}</p>
            <div className="mt-4 text-xs text-blue-600 flex items-center gap-2">
              <Award className="w-3 h-3" />
              Score: {result.improved_score.final_score}/100
            </div>
          </motion.div>
        </div>

        {result.suggested_hashtags && result.suggested_hashtags.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {result.suggested_hashtags.map((tag, index) => (
              <motion.span
                key={tag}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full shadow-md"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                #{tag.replace(/^#/, '')}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-multiply filter blur-xl"
          style={{
            background: `radial-gradient(circle, ${
              ['#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'][i]
            }20 0%, transparent 70%)`,
            width: Math.random() * 300 + 200,
            height: Math.random() * 300 + 200,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
}

export default function CreatePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'simple' | 'conversational'>('simple');
  const [idea, setIdea] = useState('');
  const [platform, setPlatform] = useState<Platform>('LinkedIn');
  const [targetLanguage, setTargetLanguage] = useState<IndicLanguage>('English');
  const [culturalContext, setCulturalContext] = useState<CulturalContext>('None');
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [activeOptType, setActiveOptType] = useState<string>('');
  const [error, setError] = useState('');

  const [conversationId, setConversationId] = useState<string>('');
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ConversationQuestion | null>(null);
  const [conversationProgress, setConversationProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [isConversationLoading, setIsConversationLoading] = useState(false);

  const [imageMode, setImageMode] = useState<'none' | 'generate' | 'modify'>('none');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);

  const [hoveredPlatform, setHoveredPlatform] = useState<Platform | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setUploadedImagePreview(URL.createObjectURL(file));
    }
  };

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('creo_token');
    if (!token) {
      router.push('/login');
      return null;
    }
    return token;
  };

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed');
    } finally {
      setOptimizing(null);
    }
  };

  const scoreColors: Record<string, string> = {
    hook_score: '#f59e0b',
    clarity_score: '#10b981',
    cta_score: '#8b5cf6',
    final_score: '#3b82f6',
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50"
        style={{ scaleX, transformOrigin: '0%' }}
      />
      
      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        <FloatingOrbs />

        <motion.div
          className="relative flex flex-col gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-4xl sm:text-5xl font-bold"
                variants={itemVariants}
              >
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Create Content
                </span>
              </motion.h1>
              <motion.p 
                className="text-gray-500 text-sm mt-2 flex items-center gap-2"
                variants={itemVariants}
              >
                <Brain className="w-4 h-4 text-blue-500" />
                Generate, score, and optimize your social media posts with AI
              </motion.p>
            </div>
            
            <motion.div
              className="hidden sm:block"
              animate={floatingAnimation.animate}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg"
            variants={itemVariants}
            whileHover={{ boxShadow: "0 20px 40px -15px rgba(0,0,0,0.2)" }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Choose your experience:
            </span>
            <div className="flex gap-2">
              {['simple', 'conversational'].map((m) => (
                <motion.button
                  key={m}
                  onClick={() => setMode(m as 'simple' | 'conversational')}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-medium transition-all overflow-hidden ${
                    mode === m
                      ? 'text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {mode === m && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
                      layoutId="modeBackground"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">
                    {m === 'simple' ? '⚡ Quick Mode' : '🎯 Guided Mode'}
                  </span>
                </motion.button>
              ))}
            </div>
            <motion.div
              className="text-xs text-gray-400 ml-auto flex items-center gap-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              {mode === 'simple' ? 'Perfect for quick content' : 'Ideal for detailed content'}
            </motion.div>
          </motion.div>
        </motion.div>

        {mode === 'conversational' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative overflow-hidden p-6 sm:p-8 bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-2xl">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              />
              
              <div className="relative">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-blue-500" />
                      Platform
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {PLATFORMS.map((p) => (
                        <motion.button
                          key={p}
                          onClick={() => setPlatform(p)}
                          onHoverStart={() => setHoveredPlatform(p)}
                          onHoverEnd={() => setHoveredPlatform(null)}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                            platform === p
                              ? 'border-transparent shadow-xl'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {platform === p && (
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-r ${PLATFORM_META[p].gradient} opacity-10`}
                              layoutId="platformBackground"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={hoveredPlatform === p ? { x: ['-100%', '200%'] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <div className="relative flex items-center gap-3">
                            <span className="text-2xl">{PLATFORM_META[p].icon}</span>
                            <div className="text-left">
                              <p className={`font-medium text-sm ${
                                platform === p ? `text-${PLATFORM_META[p].color}-700` : 'text-gray-700'
                              }`}>
                                {p}
                              </p>
                              <p className={`text-xs ${
                                platform === p ? `text-${PLATFORM_META[p].color}-600` : 'text-gray-400'
                              }`}>
                                {PLATFORM_META[p].desc}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-500" />
                        Language
                      </label>
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value as IndicLanguage)}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:border-gray-300 transition-all"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                              {LANGUAGE_META[lang].flag} {LANGUAGE_META[lang].native}
                            </option>
                          ))}
                        </select>
                        <motion.div
                          className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
                          animate={{ rotate: 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </motion.div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Stars className="w-4 h-4 text-yellow-500" />
                        Cultural Context
                      </label>
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <select
                          value={culturalContext}
                          onChange={(e) => setCulturalContext(e.target.value as CulturalContext)}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:border-gray-300 transition-all"
                        >
                          {CULTURAL_CONTEXTS.map((context) => (
                            <option key={context} value={context}>
                              {CULTURAL_CONTEXT_META[context].icon} {context}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>

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

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="mt-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        )}

        {mode === 'simple' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="relative overflow-hidden p-6 sm:p-8 bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-2xl">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              />
              
              <div className="relative space-y-6 sm:space-y-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-blue-500" />
                      Platform
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {PLATFORMS.map((p) => (
                        <motion.button
                          key={p}
                          onClick={() => setPlatform(p)}
                          onHoverStart={() => setHoveredPlatform(p)}
                          onHoverEnd={() => setHoveredPlatform(null)}
                          className={`relative p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                            platform === p
                              ? 'border-transparent shadow-xl'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
                          }`}
                          whileHover={{ scale: 1.03, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {platform === p && (
                            <motion.div
                              className={`absolute inset-0 bg-gradient-to-r ${PLATFORM_META[p].gradient} opacity-10`}
                              layoutId="simplePlatformBackground"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={hoveredPlatform === p ? { x: ['-100%', '200%'] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <div className="relative text-center space-y-2">
                            <motion.span
                              className="text-3xl sm:text-4xl block"
                              animate={hoveredPlatform === p ? { scale: 1.2, rotate: 5 } : {}}
                            >
                              {PLATFORM_META[p].icon}
                            </motion.span>
                            <div>
                              <p className={`font-medium text-base ${
                                platform === p ? `text-${PLATFORM_META[p].color}-700` : 'text-gray-700'
                              }`}>
                                {p}
                              </p>
                              <p className={`text-xs ${
                                platform === p ? `text-${PLATFORM_META[p].color}-600` : 'text-gray-400'
                              }`}>
                                {PLATFORM_META[p].desc}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-500" />
                      Target Language
                    </label>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value as IndicLanguage)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:border-gray-300 transition-all"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>
                            {LANGUAGE_META[lang].flag} {LANGUAGE_META[lang].native}
                          </option>
                        ))}
                      </select>
                      <motion.div
                        className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
                        animate={{ rotate: 180 }}
                      >
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                      <Stars className="w-4 h-4 text-yellow-500" />
                      Cultural Context
                    </label>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <select
                        value={culturalContext}
                        onChange={(e) => setCulturalContext(e.target.value as CulturalContext)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer hover:border-gray-300 transition-all"
                      >
                        {CULTURAL_CONTEXTS.map((context) => (
                          <option key={context} value={context}>
                            {CULTURAL_CONTEXT_META[context].icon} {context}
                          </option>
                        ))}
                      </select>
                      {culturalContext !== 'None' && (
                        <motion.div
                          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-blue-400"
                          animate={pulseAnimation.animate}
                        />
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="idea" className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                    <Feather className="w-4 h-4 text-orange-500" />
                    Your content idea
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Textarea
                      id="idea"
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      rows={4}
                      placeholder={`Describe your post idea for ${platform}...`}
                      className="resize-none border-2 border-gray-200 focus:border-blue-500 transition-all rounded-xl shadow-sm"
                    />
                  </motion.div>
                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-xs text-gray-400">{idea.length} characters</p>
                    {idea.length > 0 && (
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >
                        <motion.div
                          className={`w-2 h-2 rounded-full ${
                            idea.length < 50 ? 'bg-red-500' :
                            idea.length < 100 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-xs text-gray-500">
                          {idea.length < 50 ? 'Add more detail' :
                           idea.length < 100 ? 'Good start' : 'Perfect length'}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="pt-6 border-t border-gray-200"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Image className="w-4 h-4 text-green-500" />
                    Visuals
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { mode: 'none' as const, label: 'No Image', icon: X, gradient: 'from-gray-400 to-gray-500' },
                      { mode: 'generate' as const, label: 'AI Generate', icon: Sparkles, gradient: 'from-purple-400 to-pink-500' },
                      { mode: 'modify' as const, label: 'Upload & Modify', icon: Upload, gradient: 'from-blue-400 to-cyan-500' }
                    ].map(({ mode: imgMode, label, icon: Icon, gradient }) => (
                      <motion.button
                        key={imgMode}
                        onClick={() => setImageMode(imgMode)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                          imageMode === imgMode
                            ? 'border-transparent shadow-xl'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {imageMode === imgMode && (
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10`}
                            layoutId="imageModeBackground"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <div className="relative flex flex-col items-center gap-2">
                          <Icon className={`w-5 h-5 ${
                            imageMode === imgMode ? `text-${gradient.split('-')[1]}-600` : 'text-gray-600'
                          }`} />
                          <span className="text-xs font-medium text-gray-700">{label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {imageMode === 'modify' && (
                      <motion.div
                        key="modify"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <motion.div
                          className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50/50 hover:border-blue-400 transition-colors overflow-hidden group"
                          whileHover={{ scale: 1.02 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
                            animate={{
                              backgroundPosition: ['0% 0%', '100% 100%'],
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                          />
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          {uploadedImagePreview ? (
                            <motion.div
                              className="flex flex-col items-center space-y-3"
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring" }}
                            >
                              <motion.img
                                src={uploadedImagePreview}
                                alt="Preview"
                                className="h-32 w-auto rounded-xl shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring" }}
                              />
                              <span className="text-sm text-gray-500">Click to change image</span>
                            </motion.div>
                          ) : (
                            <div className="flex flex-col items-center text-gray-500 space-y-3">
                              <motion.div
                                animate={{
                                  y: [0, -10, 0],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                              >
                                <Upload className="w-16 h-16 text-gray-400" />
                              </motion.div>
                              <div>
                                <span className="text-base font-medium text-gray-700">Click to upload reference image</span>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 10MB</p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                        <Input
                          type="text"
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="How should AI modify this image? (e.g. 'remove background', 'make it snowy')"
                          className="border-2 border-gray-200 focus:border-blue-500"
                        />
                      </motion.div>
                    )}

                    {imageMode === 'generate' && (
                      <motion.div
                        key="generate"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200"
                      >
                        <motion.div
                          className="flex items-center gap-4"
                          animate={{ x: [0, 10, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <div className="relative">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                            <motion.div
                              className="absolute inset-0 rounded-full bg-purple-400"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                          <p className="text-sm text-purple-700 font-medium">
                            An AI image will be generated automatically based on your post idea
                          </p>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !idea.trim()}
                    loading={generating}
                    size="lg"
                    className="w-full relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating with AI...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          Generate Content
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {post && (
            <motion.div
              key="post-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 space-y-5"
              >
                <motion.div
                  className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"
                  animate={{
                    x: [0, 20, 0],
                    y: [0, -20, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Generated Content
                    </h2>
                    <div className="flex items-center gap-2">
                      <CopyButton text={post.content} />
                      <motion.span
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        {post.platform}
                      </motion.span>
                      <motion.span
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        {LANGUAGE_META[post.target_language].flag} {LANGUAGE_META[post.target_language].code}
                      </motion.span>
                      {post.cultural_context && post.cultural_context !== 'None' && (
                        <motion.span
                          className={`px-3 py-1.5 bg-gradient-to-r ${CULTURAL_CONTEXT_META[post.cultural_context].gradient} text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {CULTURAL_CONTEXT_META[post.cultural_context].icon} {post.cultural_context}
                        </motion.span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence mode="wait">
                      {post.image_url && (
                        <motion.div
                          key="image"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative group w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-lg"
                        >
                          <motion.img
                            src={post.image_url}
                            alt="Generated post visual"
                            className="w-full h-auto object-cover max-h-96"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <motion.a
                              href={post.image_url}
                              download="creo-ai-visual.jpg"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg"
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="w-4 h-4 text-blue-600" />
                              Download
                            </motion.a>
                          </motion.div>
                          <motion.div
                            className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5"
                            initial={{ x: -100 }}
                            animate={{ x: 0 }}
                            transition={{ type: "spring", delay: 0.5 }}
                          >
                            <Sparkles className="w-3 h-3" />
                            AI Generated
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {generatingImage && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-64 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 flex flex-col items-center justify-center gap-4"
                      >
                        <div className="relative">
                          <motion.div
                            className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          />
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <span className="text-2xl">🎨</span>
                          </motion.div>
                        </div>
                        <motion.span
                          className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Generating image with Nova Canvas...
                        </motion.span>
                        <span className="text-xs text-gray-400">This may take 10–20 seconds</span>
                      </motion.div>
                    )}

                    <motion.div
                      className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-200"
                      whileHover={{ boxShadow: "0 10px 30px -15px rgba(0,0,0,0.2)" }}
                      transition={{ duration: 0.3 }}
                    >
                      {post.content}
                    </motion.div>
                  </div>

                  {post.suggested_hashtags && post.suggested_hashtags.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="mt-4"
                    >
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <Hash className="w-3 h-3" />
                        Suggested Hashtags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {post.suggested_hashtags.map((tag: string, index) => (
                          <motion.span
                            key={tag}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full shadow-md"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.1, y: -2 }}
                          >
                            #{tag.replace(/^#/, '')}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        Engagement Score Breakdown
                      </h3>
                      <motion.span
                        className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.3 }}
                      >
                        {post.final_score}
                        <span className="text-sm text-gray-400 font-normal">/100</span>
                      </motion.span>
                    </div>
                    <div className="space-y-4">
                      <ScoreBar label="Hook Strength" score={post.hook_score} color={scoreColors.hook_score} icon={Target} />
                      <ScoreBar label="Clarity" score={post.clarity_score} color={scoreColors.clarity_score} icon={Eye} />
                      <ScoreBar label="Call-to-Action" score={post.cta_score} color={scoreColors.cta_score} icon={Zap} />
                      <ScoreBar label="Overall Score" score={post.final_score} color={scoreColors.final_score} icon={Award} />
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{ duration: 20, repeat: Infinity }}
                />

                <div className="relative">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-blue-500" />
                    Optimization Panel
                  </h2>
                  <p className="text-xs text-gray-400 mb-6 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    AI will rewrite and re-score your content
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { type: 'hook' as const, label: 'Improve Hook', icon: Target, desc: 'Stronger opening', gradient: 'from-orange-500 to-red-500' },
                      { type: 'cta' as const, label: 'Improve CTA', icon: Zap, desc: 'Better call-to-action', gradient: 'from-purple-500 to-pink-500' },
                      { type: 'hashtags' as const, label: 'Suggest Hashtags', icon: Hash, desc: 'Optimized tags', gradient: 'from-blue-500 to-cyan-500' },
                    ].map(({ type, label, icon: Icon, desc, gradient }) => (
                      <motion.button
                        key={type}
                        onClick={() => handleOptimize(type)}
                        disabled={!!optimizing}
                        className="relative group p-5 rounded-xl border-2 border-gray-200 hover:border-transparent transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="relative flex flex-col items-center text-center gap-2">
                          <motion.div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}
                            whileHover={{ rotate: 5 }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                              {optimizing === type ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Optimizing...
                                </span>
                              ) : (
                                label
                              )}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">{desc}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {optimizationResult && (
                  <OptimizationCard
                    result={optimizationResult}
                    type={activeOptType}
                    onClose={() => setOptimizationResult(null)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}