'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton, DashboardSkeleton } from '@/components/ui/Skeleton';
import type { DashboardData } from '@/types/analytics';
import {
  TrendingUp,
  Users,
  Target,
  Zap,
  BarChart3,
  FileText,
  Plus,
  Sparkles,
  Award,
  Rocket,
  Eye,
  Heart,
  Share2,
  Clock,
  Calendar,
  ChevronRight,
  Activity,
  Globe2,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Flame
} from 'lucide-react';

const PLATFORM_COLORS: Record<string, string> = {
  Twitter: '#1d9bf0',
  LinkedIn: '#0a66c2',
  Instagram: '#E1306C',
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const gradientColors = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  pink: 'from-pink-500 to-pink-600',
  orange: 'from-orange-500 to-orange-600',
  green: 'from-green-500 to-green-600',
  teal: 'from-teal-500 to-teal-600'
};

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

const statCardVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }),
  hover: {
    scale: 1.05,
    y: -5,
    transition: { duration: 0.3 }
  }
};

function StatCard({ 
  label, 
  value, 
  sub, 
  icon, 
  trend,
  color = 'blue',
  index = 0 
}: { 
  label: string; 
  value: string | number; 
  sub?: string; 
  icon: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
  color?: keyof typeof gradientColors;
  index?: number;
}) {
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : 'text-red-600';
  const trendIcon = trend?.direction === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />;

  return (
    <motion.div
      className="relative group"
      variants={statCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      {/* Background gradient effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradientColors[color]} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Main card */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className={`w-12 h-12 bg-gradient-to-br ${gradientColors[color]} rounded-xl flex items-center justify-center shadow-lg`}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring" }}
            >
              <div className="text-white">
                {icon}
              </div>
            </motion.div>
            
            <div className="flex items-center gap-2">
              {sub && (
                <motion.span 
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {sub}
                </motion.span>
              )}
              
              {trend && (
                <motion.div 
                  className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${trendColor} bg-opacity-10`}
                  style={{ backgroundColor: trend.direction === 'up' ? '#22c55e20' : '#ef444420' }}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {trendIcon}
                  {trend.value}%
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <motion.p 
              className="text-3xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {value}
            </motion.p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, change, icon, color = 'blue' }: any) {
  return (
    <motion.div
      className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <div className={`w-8 h-8 bg-gradient-to-br ${gradientColors[color]} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl font-bold text-gray-900">{value}</span>
        {change && (
          <span className={`text-xs font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <motion.div
        className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-200/50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-bold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const fetchDashboard = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlUser = urlParams.get('user');

    if (urlToken) {
      localStorage.setItem('creo_token', urlToken);
      if (urlUser) localStorage.setItem('creo_user', urlUser);
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
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-[60vh]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring" }}
      >
        <Card className="p-8 max-w-md w-full relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          
          <div className="relative text-center space-y-6">
            <motion.div 
              className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.5 }}
            >
              <BarChart3 className="w-10 h-10 text-red-500" />
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Unable to load dashboard</h3>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={fetchDashboard} 
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!data) return null;

  const hasData = data.total_posts > 0;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50"
        style={{ scaleX, transformOrigin: '0%' }}
      />

      <motion.div 
        className="space-y-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with gradient */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          variants={itemVariants}
        >
          <div>
            <motion.h1 
              className="text-3xl sm:text-4xl font-bold"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Analytics Dashboard
              </span>
            </motion.h1>
            <motion.p 
              className="text-gray-500 text-sm mt-2 flex items-center gap-2"
              variants={itemVariants}
            >
              <Activity className="w-4 h-4 text-blue-500" />
              Your content performance at a glance
            </motion.p>
          </div>

          <motion.div variants={itemVariants}>
            <Button
              onClick={() => router.push('/create')}
              size="lg"
              className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Post
                <Sparkles className="w-4 h-4 opacity-70" />
              </span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Timeframe selector */}
        <motion.div 
          className="flex items-center gap-2 bg-white/70 backdrop-blur-sm p-1 rounded-2xl border border-gray-200/50 w-fit"
          variants={itemVariants}
        >
          {['week', 'month', 'year'].map((tf) => (
            <motion.button
              key={tf}
              onClick={() => setSelectedTimeframe(tf as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                selectedTimeframe === tf
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tf}
            </motion.button>
          ))}
        </motion.div>

        {/* Stat Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={containerVariants}
        >
          <StatCard 
            icon={<FileText className="w-6 h-6" />}
            label="Total Posts"
            value={data.total_posts}
            sub={data.total_posts > 0 ? 'Active' : undefined}
            color="blue"
            index={0}
            trend={data.total_posts > 10 ? { value: 12, direction: 'up' } : undefined}
          />
          
          <StatCard 
            icon={<Target className="w-6 h-6" />}
            label="Average Score"
            value={`${data.avg_score}/100`}
            color="purple"
            index={1}
            trend={data.avg_score > 75 ? { value: 8, direction: 'up' } : { value: 3, direction: 'down' }}
          />
          
          <StatCard 
            icon={<Zap className="w-6 h-6" />}
            label="Best Platform"
            value={data.best_platform || 'N/A'}
            color="pink"
            index={2}
            sub="Top performer"
          />
          
          <StatCard 
            icon={<TrendingUp className="w-6 h-6" />}
            label="Success Rate"
            value={`${data.optimization_success_rate}%`}
            sub={data.optimization_success_rate > 50 ? 'Great!' : 'Needs work'}
            color="green"
            index={3}
            trend={{ value: 5, direction: data.optimization_success_rate > 50 ? 'up' : 'down' }}
          />
        </motion.div>

        {!hasData ? (
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden"
          >
            <Card className="p-8 sm:p-12 text-center relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{ duration: 20, repeat: Infinity }}
              />
              
              <div className="relative space-y-8">
                <motion.div 
                  className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl flex items-center justify-center mx-auto"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />
                </motion.div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">No posts yet</h2>
                  <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                    Create your first AI-powered post to start tracking your content performance and engagement metrics.
                  </p>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => router.push('/create')}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl px-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create your first post
                    <Rocket className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Quick metrics row */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              variants={itemVariants}
            >
              <MetricCard 
                title="Views" 
                value="12.5k" 
                change={8.2} 
                icon={<Eye className="w-4 h-4 text-white" />}
                color="blue"
              />
              <MetricCard 
                title="Likes" 
                value="3.2k" 
                change={12.5} 
                icon={<Heart className="w-4 h-4 text-white" />}
                color="pink"
              />
              <MetricCard 
                title="Shares" 
                value="845" 
                change={-2.1} 
                icon={<Share2 className="w-4 h-4 text-white" />}
                color="purple"
              />
              <MetricCard 
                title="Engagement" 
                value="4.8%" 
                change={0.5} 
                icon={<Flame className="w-4 h-4 text-white" />}
                color="orange"
              />
            </motion.div>

            {/* Engagement Trend with Area Chart */}
            <motion.div
              variants={itemVariants}
              onHoverStart={() => setHoveredChart('trend')}
              onHoverEnd={() => setHoveredChart(null)}
            >
              <Card className="p-4 sm:p-6 relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
                  animate={hoveredChart === 'trend' ? { opacity: 0.1 } : { opacity: 0 }}
                />
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Engagement Trend
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Last 30 days
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.engagement_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="avg_score" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fill="url(#colorScore)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bottom charts row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Platform Comparison */}
              <motion.div
                variants={itemVariants}
                onHoverStart={() => setHoveredChart('platform')}
                onHoverEnd={() => setHoveredChart(null)}
              >
                <Card className="p-4 sm:p-6 relative overflow-hidden h-full">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5"
                    animate={hoveredChart === 'platform' ? { opacity: 0.1 } : { opacity: 0 }}
                  />
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-purple-500" />
                        Platform Performance
                      </CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={data.platform_stats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="platform" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="avg_score" radius={[8, 8, 0, 0]}>
                          {data.platform_stats.map((entry, index) => (
                            <Cell
                              key={entry.platform}
                              fill={PLATFORM_COLORS[entry.platform] || PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Platform stats summary */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {data.platform_stats.map((stat) => (
                        <motion.div
                          key={stat.platform}
                          className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          whileHover={{ y: -2 }}
                        >
                          <div className="text-xs text-gray-500 mb-1">{stat.platform}</div>
                          <div className="text-sm font-bold text-gray-900">{stat.avg_score}</div>
                          <div className="text-xs text-green-600">+{stat.posts} posts</div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Score Distribution */}
              <motion.div
                variants={itemVariants}
                onHoverStart={() => setHoveredChart('distribution')}
                onHoverEnd={() => setHoveredChart(null)}
              >
                <Card className="p-4 sm:p-6 relative overflow-hidden h-full">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-blue-500/5"
                    animate={hoveredChart === 'distribution' ? { opacity: 0.1 } : { opacity: 0 }}
                  />
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Score Distribution
                      </CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={data.score_distribution}
                            dataKey="count"
                            nameKey="range"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                          >
                            {data.score_distribution.map((_, index) => (
                              <Cell 
                                key={index} 
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                stroke="white"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="flex-1 space-y-3">
                        {data.score_distribution.map((item, i) => (
                          <motion.div 
                            key={item.range} 
                            className="flex items-center gap-3 text-sm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <motion.div
                              className="w-4 h-4 rounded-lg"
                              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                              whileHover={{ scale: 1.2, rotate: 90 }}
                            />
                            <span className="text-gray-600 font-medium">{item.range}</span>
                            <span className="ml-auto font-bold text-gray-900">{item.count}</span>
                            <span className="text-xs text-gray-400">
                              ({Math.round((item.count / data.total_posts) * 100)}%)
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View all
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">New post created for LinkedIn</p>
                          <p className="text-xs text-gray-500">2 hours ago • Score: 85/100</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Published
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </>
  );
}