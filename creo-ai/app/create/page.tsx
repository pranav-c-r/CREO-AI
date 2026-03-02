'use client';

/**
 * Create Page — AI content generation, scoring, and optimization.
 * Full workflow: idea input → generate → score → optimize with before/after comparison.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, OptimizationResult } from '@/types/post';

type Platform = 'Twitter' | 'LinkedIn' | 'Instagram';

const PLATFORMS: Platform[] = ['Twitter', 'LinkedIn', 'Instagram'];

const PLATFORM_META: Record<Platform, { icon: string; desc: string }> = {
  Twitter: { icon: '𝕏', desc: 'Up to 280 chars' },
  LinkedIn: { icon: 'in', desc: 'Professional' },
  Instagram: { icon: '📸', desc: 'Visual & casual' },
};

/* ── Score Bar Component ── */
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className="font-semibold">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
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
    <div className="card p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 capitalize">{type} Optimization Result</h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
              improved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {improved ? `+${improvement}% improvement` : 'No improvement'}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Before */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">BEFORE</p>
          <p className="text-sm text-gray-700 leading-relaxed">{result.original_content}</p>
          <div className="mt-3 text-xs text-gray-400">Score: {result.original_score.final_score}/100</div>
        </div>
        {/* After */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 mb-2">AFTER</p>
          <p className="text-sm text-gray-700 leading-relaxed">{result.improved_content}</p>
          <div className="mt-3 text-xs text-blue-500">Score: {result.improved_score.final_score}/100</div>
        </div>
      </div>

      {result.suggested_hashtags && result.suggested_hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.suggested_hashtags.map((tag) => (
            <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
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
  const [idea, setIdea] = useState('');
  const [platform, setPlatform] = useState<Platform>('LinkedIn');
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [activeOptType, setActiveOptType] = useState<string>('');
  const [error, setError] = useState('');

  const getToken = (): string | null => {
    const token = localStorage.getItem('creo_token');
    if (!token) {
      router.push('/login');
      return null;
    }
    return token;
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
        body: JSON.stringify({ idea, platform }),
      });

      if (res.status === 401) { router.push('/login'); return; }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setPost(data);
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
    final_score: '#2563eb',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Content</h1>
        <p className="text-gray-500 text-sm mt-1">Generate, score, and optimize your social media posts with AI</p>
      </div>

      {/* Input card */}
      <div className="card p-6 space-y-5">
        {/* Platform selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
          <div className="flex gap-3">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                id={`platform-${p.toLowerCase()}`}
                onClick={() => setPlatform(p)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                  platform === p
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                <span className="mr-1.5">{PLATFORM_META[p].icon}</span>
                {p}
                <span className={`block text-xs mt-0.5 ${platform === p ? 'text-blue-100' : 'text-gray-400'}`}>
                  {PLATFORM_META[p].desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Idea textarea */}
        <div>
          <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
            Your content idea
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            placeholder={`Describe your post idea for ${platform}...\ne.g. "Tips for remote developers to stay productive"`}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1.5 text-right">{idea.length} chars</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          id="generate-btn"
          onClick={handleGenerate}
          disabled={generating || !idea.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating with AI...
            </>
          ) : (
            <>✨ Generate Content</>
          )}
        </button>
      </div>

      {/* Generated content + Scores */}
      {post && (
        <>
          <div className="card p-6 space-y-5">
            {/* Content header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Generated Content</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                {post.platform}
              </span>
            </div>

            {/* Content text */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Hashtags */}
            {post.suggested_hashtags && post.suggested_hashtags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Suggested Hashtags</p>
                <div className="flex flex-wrap gap-1.5">
                  {post.suggested_hashtags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full">
                      #{tag.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Score breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Engagement Score Breakdown</h3>
                <span className="text-2xl font-bold text-blue-600">{post.final_score}<span className="text-sm text-gray-400 font-normal">/100</span></span>
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
            <h2 className="text-base font-semibold text-gray-800 mb-1">Optimization Panel</h2>
            <p className="text-xs text-gray-400 mb-5">AI will rewrite and re-score your content</p>

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
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all group text-left gap-1.5"
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                    {optimizing === type ? 'Optimizing...' : label}
                  </span>
                  <span className="text-xs text-gray-400">{desc}</span>
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
