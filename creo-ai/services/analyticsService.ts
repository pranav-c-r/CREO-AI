/**
 * Analytics Service — Pure DynamoDB, no AI.
 * Aggregates user post data to compute dashboard metrics.
 */
import { dynamoDb } from '@/lib/dynamoClient';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Post } from '@/types/post';
import {
    DashboardData,
    EngagementDataPoint,
    PlatformStat,
    ScoreDistribution,
} from '@/types/analytics';

const POSTS_TABLE = process.env.POSTS_TABLE!;
const OPTIMIZATIONS_TABLE = process.env.OPTIMIZATIONS_TABLE!;

/**
 * Fetch all posts for a given user from DynamoDB.
 */
async function getUserPosts(user_id: string): Promise<Post[]> {
    const { Items = [] } = await dynamoDb.send(
        new QueryCommand({
            TableName: POSTS_TABLE,
            KeyConditionExpression: 'user_id = :uid',
            ExpressionAttributeValues: { ':uid': user_id },
            // Sort by created_at ascending (default DynamoDB sort key behavior)
        })
    );
    return Items as Post[];
}

/**
 * Count optimization records with positive improvement for the user's posts.
 */
async function getOptimizationSuccessRate(postIds: string[]): Promise<number> {
    if (postIds.length === 0) return 0;

    // Scan optimizations (small table per post) - acceptable for SaaS scale
    // A production system would use a GSI on post_id
    let successCount = 0;
    let totalCount = 0;

    for (const post_id of postIds.slice(0, 20)) { // limit to avoid excessive reads
        const { Items = [] } = await dynamoDb.send(
            new QueryCommand({
                TableName: OPTIMIZATIONS_TABLE,
                KeyConditionExpression: 'post_id = :pid',
                ExpressionAttributeValues: { ':pid': post_id },
            })
        );
        totalCount += Items.length;
        successCount += Items.filter((item) => item.improvement_percentage > 0).length;
    }

    if (totalCount === 0) return 0;
    return Math.round((successCount / totalCount) * 100);
}

/**
 * Build engagement trend — average daily score over time.
 */
function buildEngagementTrend(posts: Post[]): EngagementDataPoint[] {
    const byDate: Record<string, { total: number; count: number }> = {};

    for (const post of posts) {
        const date = post.created_at.substring(0, 10); // YYYY-MM-DD
        if (!byDate[date]) byDate[date] = { total: 0, count: 0 };
        byDate[date].total += post.final_score;
        byDate[date].count += 1;
    }

    return Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-30) // last 30 days
        .map(([date, { total, count }]) => ({
            date,
            avg_score: Math.round(total / count),
            posts: count,
        }));
}

/**
 * Build per-platform stats.
 */
function buildPlatformStats(posts: Post[]): PlatformStat[] {
    const byPlatform: Record<string, { total: number; count: number }> = {};

    for (const post of posts) {
        if (!byPlatform[post.platform]) byPlatform[post.platform] = { total: 0, count: 0 };
        byPlatform[post.platform].total += post.final_score;
        byPlatform[post.platform].count += 1;
    }

    return Object.entries(byPlatform).map(([platform, { total, count }]) => ({
        platform,
        avg_score: Math.round(total / count),
        total_posts: count,
    }));
}

/**
 * Build score distribution in 20-point buckets.
 */
function buildScoreDistribution(posts: Post[]): ScoreDistribution[] {
    const buckets = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    const counts = [0, 0, 0, 0, 0];

    for (const post of posts) {
        const idx = Math.min(Math.floor(post.final_score / 20), 4);
        counts[idx]++;
    }

    return buckets.map((range, i) => ({ range, count: counts[i] }));
}

/**
 * Main analytics function — computes all dashboard data from DynamoDB.
 */
export async function getUserAnalytics(user_id: string): Promise<DashboardData> {
    const posts = await getUserPosts(user_id);

    if (posts.length === 0) {
        return {
            total_posts: 0,
            avg_score: 0,
            best_platform: 'N/A',
            optimization_success_rate: 0,
            engagement_trend: [],
            platform_stats: [],
            score_distribution: buildScoreDistribution([]),
        };
    }

    const avgScore = Math.round(
        posts.reduce((sum, p) => sum + p.final_score, 0) / posts.length
    );

    const platformStats = buildPlatformStats(posts);
    const bestPlatform = platformStats.sort((a, b) => b.avg_score - a.avg_score)[0]?.platform || 'N/A';

    const postIds = posts.map((p) => p.post_id);
    const optimizationSuccessRate = await getOptimizationSuccessRate(postIds);

    return {
        total_posts: posts.length,
        avg_score: avgScore,
        best_platform: bestPlatform,
        optimization_success_rate: optimizationSuccessRate,
        engagement_trend: buildEngagementTrend(posts),
        platform_stats: platformStats,
        score_distribution: buildScoreDistribution(posts),
    };
}
