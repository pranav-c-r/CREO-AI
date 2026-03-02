// Types for analytics and dashboard data

export interface EngagementDataPoint {
    date: string;
    avg_score: number;
    posts: number;
}

export interface PlatformStat {
    platform: string;
    avg_score: number;
    total_posts: number;
}

export interface ScoreDistribution {
    range: string;   // e.g. "0-20", "21-40", ...
    count: number;
}

export interface DashboardData {
    total_posts: number;
    avg_score: number;
    best_platform: string;
    optimization_success_rate: number;   // percentage 0-100
    engagement_trend: EngagementDataPoint[];
    platform_stats: PlatformStat[];
    score_distribution: ScoreDistribution[];
}
