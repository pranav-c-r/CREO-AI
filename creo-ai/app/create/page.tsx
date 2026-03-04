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
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center gap-1.5 text-gray-500 hover:text-blue-600 ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="text-xs font-semibold text-green-600 pr-1">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 pr-1">Copy</span>
        </>
      )}
    </button>
  );
}

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
            className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${improved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
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
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-blue-600">AFTER</p>
            <CopyButton text={result.improved_content} />
          </div>
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

      // Handle Image Generation
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
              created_at: data.created_at, // DynamoDB sort key — required for UpdateCommand
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
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${platform === p
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

        {/* Visuals Section */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Visuals</label>
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setImageMode('none')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${imageMode === 'none' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              No Image
            </button>
            <button
              onClick={() => setImageMode('generate')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${imageMode === 'generate' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              AI Generate
            </button>
            <button
              onClick={() => setImageMode('modify')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${imageMode === 'modify' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Upload & Modify
            </button>
          </div>

          {imageMode === 'modify' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-blue-300 transition-colors relative">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {uploadedImagePreview ? (
                  <div className="flex flex-col items-center">
                    <img src={uploadedImagePreview} alt="Preview" className="h-24 w-auto rounded-lg shadow-sm mb-2" />
                    <span className="text-xs text-gray-500">Tap to change image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-medium">Click to upload reference image</span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="How should AI modify this image? (e.g. 'remove background', 'make it snowy')"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          {imageMode === 'generate' && (
            <p className="text-xs text-gray-500 italic px-2">An AI image will be generated automatically based on your post idea.</p>
          )}
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
              <div className="flex items-center gap-2">
                <CopyButton text={post.content} />
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {post.platform}
                </span>
              </div>
            </div>

            {/* Content text and image */}
            <div className="space-y-4">
              {/* Display Image if exists */}
              {post.image_url && (
                <div className="relative group w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                  <img src={post.image_url} alt="Generated post visual" className="w-full h-auto object-cover max-h-96" />
                  {/* Download Button Overlay */}
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
                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
                    AI Generated
                  </div>
                </div>
              )}
              {generatingImage && (
                <div className="w-full h-64 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg">🎨</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">Generating image with Nova Canvas...</span>
                  <span className="text-xs text-blue-400">This may take 10–20 seconds</span>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
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
