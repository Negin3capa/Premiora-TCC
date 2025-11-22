/**
 * Service for managing community metrics and activity tracking
 * Provides real-time metrics for communities
 */

import { supabase } from "../../utils/supabaseClient";
import type { CommunityMetrics } from "../../types/community";

export class CommunityMetricsService {
    /**
     * Update user activity timestamp for a community
     * Should be called when user views or interacts with community
     * @param communityId - Community ID
     * @returns Promise<void>
     */
    static async updateUserActivity(communityId: string): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.rpc("update_user_activity", {
                p_community_id: communityId,
                p_user_id: user.id,
            });

            if (error) {
                console.error("Error updating user activity:", error);
            }
        } catch (error) {
            console.error("Failed to update user activity:", error);
        }
    }

    /**
     * Get count of users online now (active in last 15 minutes)
     * @param communityId - Community ID
     * @returns Promise<number>
     */
    static async getOnlineUsersCount(communityId: string): Promise<number> {
        try {
            const { data, error } = await supabase.rpc(
                "get_online_users_count",
                {
                    p_community_id: communityId,
                },
            );

            if (error) {
                console.error("Error fetching online users count:", error);
                return 0;
            }

            return data || 0;
        } catch (error) {
            console.error("Failed to get online users count:", error);
            return 0;
        }
    }

    /**
     * Get count of users active today (last 24 hours)
     * @param communityId - Community ID
     * @returns Promise<number>
     */
    static async getActiveUsersToday(communityId: string): Promise<number> {
        try {
            const { data, error } = await supabase.rpc(
                "get_active_users_today",
                {
                    p_community_id: communityId,
                },
            );

            if (error) {
                console.error("Error fetching active users today:", error);
                return 0;
            }

            return data || 0;
        } catch (error) {
            console.error("Failed to get active users today:", error);
            return 0;
        }
    }

    /**
     * Get count of users active this week (last 7 days)
     * @param communityId - Community ID
     * @returns Promise<number>
     */
    static async getActiveUsersWeek(communityId: string): Promise<number> {
        try {
            const { data, error } = await supabase.rpc(
                "get_active_users_week",
                {
                    p_community_id: communityId,
                },
            );

            if (error) {
                console.error("Error fetching active users week:", error);
                return 0;
            }

            return data || 0;
        } catch (error) {
            console.error("Failed to get active users week:", error);
            return 0;
        }
    }

    /**
     * Get total post count for a community
     * @param communityId - Community ID
     * @returns Promise<number>
     */
    static async getTotalPostsCount(communityId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from("posts")
                .select("*", { count: "exact", head: true })
                .eq("community_id", communityId)
                .eq("is_published", true);

            if (error) {
                console.error("Error fetching total posts count:", error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error("Failed to get total posts count:", error);
            return 0;
        }
    }

    /**
     * Get comprehensive metrics for a community
     * @param communityId - Community ID
     * @param memberCount - Current member count (from community object)
     * @returns Promise<CommunityMetrics>
     */
    static async getCommunityMetrics(
        communityId: string,
        memberCount: number,
    ): Promise<CommunityMetrics> {
        try {
            // Fetch all metrics in parallel
            const [onlineNow, activeToday, activeThisWeek, totalPosts] =
                await Promise.all([
                    this.getOnlineUsersCount(communityId),
                    this.getActiveUsersToday(communityId),
                    this.getActiveUsersWeek(communityId),
                    this.getTotalPostsCount(communityId),
                ]);

            return {
                onlineNow,
                activeToday,
                activeThisWeek,
                totalPosts,
                totalMembers: memberCount,
            };
        } catch (error) {
            console.error("Failed to get community metrics:", error);
            // Return zeros on error
            return {
                onlineNow: 0,
                activeToday: 0,
                activeThisWeek: 0,
                totalPosts: 0,
                totalMembers: memberCount,
            };
        }
    }

    /**
     * Get pinned posts count for a community
     * @param communityId - Community ID
     * @returns Promise<number>
     */
    static async getPinnedPostsCount(communityId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from("posts")
                .select("*", { count: "exact", head: true })
                .eq("community_id", communityId)
                .eq("is_pinned", true)
                .eq("is_published", true);

            if (error) {
                console.error("Error fetching pinned posts count:", error);
                return 0;
            }

            return count || 0;
        } catch (error) {
            console.error("Failed to get pinned posts count:", error);
            return 0;
        }
    }
}
