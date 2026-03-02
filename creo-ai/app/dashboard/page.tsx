'use client';

/**
 * Dashboard Page — Analytics overview with charts.
 * Fetches from GET /api/dashboard using stored JWT.
 */
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { DashboardData } from '@/types/analytics';

const PLATFORM_COLORS: Record<string, string> = {
  Twitter: '#1d9bf0',
  LinkedIn: '#0a66c2',
  Instagram: '#E1306C',
};
const PIE_COLORS = ['#e5e7eb', '#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8'];

function StatCard({
  label, value, sub, icon,
}: { label: string; value: string | number; sub?: string; icon: string }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    // Check if we just redirected from Google Auth
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlUser = urlParams.get('user');

    if (urlToken) {
      localStorage.setItem('creo_token', urlToken);
      if (urlUser) localStorage.setItem('creo_user', urlUser);
      // Clean up the URL
      router.replace('/dashboard');
    }

    const token = localStorage.getItem('creo_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('creo_token');
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error('Failed to load dashboard data');
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center card p-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchDashboard} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Your content performance at a glance</p>
        </div>
        <button
          onClick={() => router.push('/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Create Post
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon="📝" label="Total Posts" value={data.total_posts} />
        <StatCard icon="⭐" label="Average Score" value={`${data.avg_score}/100`} />
        <StatCard icon="🏆" label="Best Platform" value={data.best_platform || 'N/A'} />
        <StatCard
          icon="🚀"
          label="Optimization Success Rate"
          value={`${data.optimization_success_rate}%`}
          sub={data.optimization_success_rate > 50 ? 'Great!' : undefined}
        />
      </div>

      {data.total_posts === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-5xl mb-4">✨</p>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h2>
          <p className="text-gray-500 text-sm mb-6">Create your first AI-powered post to see analytics here.</p>
          <button
            onClick={() => router.push('/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm"
          >
            Create your first post
          </button>
        </div>
      ) : (
        <>
          {/* Engagement Trend */}
          <div className="card p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5">Engagement Trend (Last 30 days)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.engagement_trend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  formatter={(v) => [`${v}`, 'Avg Score']}
                />
                <Line
                  type="monotone"
                  dataKey="avg_score"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Comparison */}
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-5">Platform Comparison</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.platform_stats} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip formatter={(value, name) => [value, name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  <Bar dataKey="avg_score" radius={[6, 6, 0, 0]}>
                    {data.platform_stats.map((entry) => (
                      <Cell
                        key={entry.platform}
                        fill={PLATFORM_COLORS[entry.platform] || '#3b82f6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Score Distribution */}
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-5">Score Distribution</h2>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.score_distribution}
                      dataKey="count"
                      nameKey="range"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                    >
                      {data.score_distribution.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [v, `Score ${name}`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {data.score_distribution.map((item, i) => (
                    <div key={item.range} className="flex items-center gap-2 text-xs text-gray-600">
                      <span
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span>{item.range}</span>
                      <span className="ml-auto font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
