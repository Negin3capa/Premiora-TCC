import { supabase } from "../../utils/supabaseClient";

export interface CommunityMetrics {
    onlineCount: number;
    activeToday: number;
    activeWeek: number;
    totalPosts: number;
    newMembersWeek: number;
}

export class CommunityMetricsService {
    /**
     * Updates the user's last seen timestamp for a community
     */
    static async trackActivity(
        communityId: string,
        userId: string,
    ): Promise<void> {
        try {
            const { error } = await supabase.rpc("update_user_activity", {
                p_community_id: communityId,
                p_user_id: userId,
            });

            if (error) throw error;
        } catch (error) {
            console.error("Error tracking community activity:", error);
        }
    }

    /**
     * Fetches real-time metrics for a community
     */
    static async getMetrics(communityId: string): Promise<CommunityMetrics> {
        try {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const [onlineRes, todayRes, weekRes, postsRes, newMembersRes] =
                await Promise.all([
                    supabase.rpc("get_online_users_count", {
                        p_community_id: communityId,
                    }),
                    supabase.rpc("get_active_users_today", {
                        p_community_id: communityId,
                    }),
                    supabase.rpc("get_active_users_week", {
                        p_community_id: communityId,
                    }),
                    supabase.from("posts").select("id", {
                        count: "exact",
                        head: true,
                    }).eq("community_id", communityId),
                    supabase.from("community_members")
                        .select("id", { count: "exact", head: true })
                        .eq("community_id", communityId)
                        .gte("joined_at", weekAgo.toISOString()),
                ]);

            if (onlineRes.error) throw onlineRes.error;
            if (todayRes.error) throw todayRes.error;
            if (weekRes.error) throw weekRes.error;
            if (postsRes.error) throw postsRes.error;
            if (newMembersRes.error) throw newMembersRes.error;

            return {
                onlineCount: onlineRes.data || 0,
                activeToday: todayRes.data || 0,
                activeWeek: weekRes.data || 0,
                totalPosts: postsRes.count || 0,
                newMembersWeek: newMembersRes.count || 0,
            };
        } catch (error) {
            console.error("Error fetching community metrics:", error);
            return {
                onlineCount: 0,
                activeToday: 0,
                activeWeek: 0,
                totalPosts: 0,
                newMembersWeek: 0,
            };
        }
    }
}
