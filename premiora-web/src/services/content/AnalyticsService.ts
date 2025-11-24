import { supabase } from "../../utils/supabaseClient";

export interface AnalyticsSummary {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalRevenue: number;
    activeSubscribers: number;
    totalFollowers: number;
    newSubscribers: number; // Last 30 days
    cancellations: number; // Last 30 days
    // Growth metrics (percentages)
    viewsGrowth: number;
    likesGrowth: number;
    commentsGrowth: number;
    revenueGrowth: number;
    subscribersGrowth: number;
    followersGrowth: number;
}

export interface DailyMetric {
    date: string;
    views: number;
    revenue: number;
    newSubscribers: number;
}

export class AnalyticsService {
    /**
     * Fetches the summary analytics for a creator.
     */
    static async getCreatorSummary(
        creatorId: string,
    ): Promise<AnalyticsSummary> {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

            // 1. Fetch Total Views (Sum of views from all posts)
            const { data: postsData, error: postsError } = await supabase
                .from("posts")
                .select("views, id")
                .eq("creator_id", creatorId);

            if (postsError) throw postsError;

            const totalViews = postsData?.reduce((sum, post) =>
                sum + (post.views || 0), 0) || 0;

            // 2. Fetch Total Likes & Growth
            const postIds = postsData?.map((p) =>
                p.id
            ) || [];

            const { count: totalLikes, error: likesError } = await supabase
                .from("post_likes")
                .select("id", { count: "exact", head: true })
                .in("post_id", postIds);

            if (likesError && postIds.length > 0) {
                console.error("Error fetching likes:", likesError);
            }

            let likesGrowth = 0;
            if (totalLikes && totalLikes > 0 && postIds.length > 0) {
                const { count: newLikes } = await supabase
                    .from("post_likes")
                    .select("id", { count: "exact", head: true })
                    .in("post_id", postIds)
                    .gte("created_at", thirtyDaysAgoStr);

                const prevLikes = (totalLikes || 0) - (newLikes || 0);
                if (prevLikes > 0) {
                    likesGrowth = ((newLikes || 0) / prevLikes) * 100;
                } else if (newLikes && newLikes > 0) {
                    likesGrowth = 100;
                }
            }

            // 3. Fetch Total Comments & Growth
            const { count: totalComments, error: commentsError } =
                await supabase
                    .from("comments")
                    .select("id", { count: "exact", head: true })
                    .in("post_id", postIds);

            if (commentsError && postIds.length > 0) {
                console.error("Error fetching comments:", commentsError);
            }

            let commentsGrowth = 0;
            if (totalComments && totalComments > 0 && postIds.length > 0) {
                const { count: newComments } = await supabase
                    .from("comments")
                    .select("id", { count: "exact", head: true })
                    .in("post_id", postIds)
                    .gte("created_at", thirtyDaysAgoStr);

                const prevComments = (totalComments || 0) - (newComments || 0);
                if (prevComments > 0) {
                    commentsGrowth = ((newComments || 0) / prevComments) * 100;
                } else if (newComments && newComments > 0) {
                    commentsGrowth = 100;
                }
            }

            // 4. Fetch Active Subscribers & Growth
            const { data: tiers } = await supabase
                .from("subscription_tiers")
                .select("id")
                .eq("creator_channel_id", creatorId);

            const tierIds = tiers?.map((t) =>
                t.id
            ) || [];

            let activeSubscribers = 0;
            let newSubscribers = 0;
            let cancellations = 0;

            if (tierIds.length > 0) {
                const { count: subsCount } = await supabase
                    .from("user_subscriptions")
                    .select("*", { count: "exact", head: true })
                    .in("plan_id", tierIds)
                    .eq("status", "active");
                activeSubscribers = subsCount || 0;

                const { count: newSubsCount } = await supabase
                    .from("user_subscriptions")
                    .select("*", { count: "exact", head: true })
                    .in("plan_id", tierIds)
                    .gte("created_at", thirtyDaysAgoStr);
                newSubscribers = newSubsCount || 0;

                const { count: cancelCount } = await supabase
                    .from("user_subscriptions")
                    .select("*", { count: "exact", head: true })
                    .in("plan_id", tierIds)
                    .eq("status", "canceled")
                    .gte("updated_at", thirtyDaysAgoStr);
                cancellations = cancelCount || 0;
            }

            const netSubsChange = newSubscribers - cancellations;
            const prevSubs = activeSubscribers - netSubsChange;
            const subscribersGrowth = prevSubs > 0
                ? (netSubsChange / prevSubs) * 100
                : (activeSubscribers > 0 ? 100 : 0);

            // 5. Fetch Followers & Growth
            const { count: totalFollowers } = await supabase
                .from("follows")
                .select("*", { count: "exact", head: true })
                .eq("following_id", creatorId);

            let followersGrowth = 0;
            if (totalFollowers && totalFollowers > 0) {
                const { count: newFollowers } = await supabase
                    .from("follows")
                    .select("*", { count: "exact", head: true })
                    .eq("following_id", creatorId)
                    .gte("created_at", thirtyDaysAgoStr);

                const prevFollowers = (totalFollowers || 0) -
                    (newFollowers || 0);
                if (prevFollowers > 0) {
                    followersGrowth = ((newFollowers || 0) / prevFollowers) *
                        100;
                } else if (newFollowers && newFollowers > 0) {
                    followersGrowth = 100;
                }
            }

            // 6. Revenue
            const totalRevenue = activeSubscribers * 19.90;
            const revenueGrowth = subscribersGrowth;

            return {
                totalViews,
                totalLikes: totalLikes || 0,
                totalComments: totalComments || 0,
                totalRevenue,
                activeSubscribers,
                totalFollowers: totalFollowers || 0,
                newSubscribers,
                cancellations,
                viewsGrowth: 0, // Cannot calculate easily without view history
                likesGrowth,
                commentsGrowth,
                revenueGrowth,
                subscribersGrowth,
                followersGrowth,
            };
        } catch (error) {
            console.error("Error fetching analytics summary:", error);
            return {
                totalViews: 0,
                totalLikes: 0,
                totalComments: 0,
                totalRevenue: 0,
                activeSubscribers: 0,
                totalFollowers: 0,
                newSubscribers: 0,
                cancellations: 0,
                viewsGrowth: 0,
                likesGrowth: 0,
                commentsGrowth: 0,
                revenueGrowth: 0,
                subscribersGrowth: 0,
                followersGrowth: 0,
            };
        }
    }

    /**
     * Fetches daily metrics for charts.
     */
    static async getDailyMetrics(
        creatorId: string,
        days: number = 30,
    ): Promise<DailyMetric[]> {
        const metrics: DailyMetric[] = [];
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);

        try {
            // 1. Get tier IDs for this creator
            const { data: tiers } = await supabase
                .from("subscription_tiers")
                .select("id")
                .eq("creator_channel_id", creatorId);
            const tierIds = tiers?.map((t) => t.id) || [];

            // 2. Fetch New Subscribers by Date
            let subscriptions: any[] = [];
            if (tierIds.length > 0) {
                const { data: subs } = await supabase
                    .from("user_subscriptions")
                    .select("created_at")
                    .in("plan_id", tierIds)
                    .gte("created_at", startDate.toISOString());
                subscriptions = subs || [];
            }

            // 3. Group by date
            const subsByDate: Record<string, number> = {};
            subscriptions.forEach((sub) => {
                const dateStr =
                    new Date(sub.created_at).toISOString().split("T")[0];
                subsByDate[dateStr] = (subsByDate[dateStr] || 0) + 1;
            });

            // 4. Build metrics array
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split("T")[0];

                metrics.push({
                    date: dateStr,
                    views: 0, // No daily views history available yet
                    revenue: (subsByDate[dateStr] || 0) * 19.90, // Estimate based on new subs
                    newSubscribers: subsByDate[dateStr] || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching daily metrics:", error);
            // Return empty metrics on error to avoid crashing UI
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                metrics.push({
                    date: d.toISOString().split("T")[0],
                    views: 0,
                    revenue: 0,
                    newSubscribers: 0,
                });
            }
        }

        return metrics;
    }
}
