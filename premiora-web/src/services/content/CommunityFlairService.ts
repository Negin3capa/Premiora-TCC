/**
 * Service for managing community flairs
 * Provides CRUD operations for flair templates and assignments
 */

import { supabase } from "../../utils/supabaseClient";
import type {
    AssignUserFlairData,
    CommunityFlair,
    CreateFlairData,
    PostFlair,
    UpdateFlairData,
    UserFlair,
} from "../../types/community";

export class CommunityFlairService {
    /**
     * Get all flair templates for a community
     * @param communityId - Community ID
     * @param type - Optional filter by flair type ('user' or 'post')
     * @returns Promise<CommunityFlair[]>
     */
    static async getCommunityFlairs(
        communityId: string,
        type?: "user" | "post",
    ): Promise<CommunityFlair[]> {
        let query = supabase
            .from("community_flairs")
            .select("*")
            .eq("community_id", communityId);

        if (type) {
            query = query.eq("flair_type", type);
        }

        const { data, error } = await query.order("created_at", {
            ascending: true,
        });

        if (error) {
            console.error("Error fetching community flairs:", error);
            throw new Error(
                `Failed to fetch community flairs: ${error.message}`,
            );
        }

        return data.map((flair) => ({
            id: flair.id,
            communityId: flair.community_id,
            flairText: flair.flair_text,
            flairColor: flair.flair_color,
            flairBackgroundColor: flair.flair_background_color,
            flairType: flair.flair_type,
            isModOnly: flair.is_mod_only,
            createdAt: flair.created_at,
            updatedAt: flair.updated_at,
        }));
    }

    /**
     * Create a new flair template
     * @param communityId - Community ID
     * @param flairData - Flair data
     * @returns Promise<CommunityFlair>
     */
    static async createFlair(
        communityId: string,
        flairData: CreateFlairData,
    ): Promise<CommunityFlair> {
        const { data, error } = await supabase
            .from("community_flairs")
            .insert({
                community_id: communityId,
                flair_text: flairData.flairText,
                flair_color: flairData.flairColor || "#3B82F6",
                flair_background_color: flairData.flairBackgroundColor ||
                    "#1E3A8A",
                flair_type: flairData.flairType,
                is_mod_only: flairData.isModOnly || false,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating flair:", error);
            throw new Error(`Failed to create flair: ${error.message}`);
        }

        return {
            id: data.id,
            communityId: data.community_id,
            flairText: data.flair_text,
            flairColor: data.flair_color,
            flairBackgroundColor: data.flair_background_color,
            flairType: data.flair_type,
            isModOnly: data.is_mod_only,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Update an existing flair template
     * @param flairId - Flair ID
     * @param flairData - Updated flair data
     * @returns Promise<CommunityFlair>
     */
    static async updateFlair(
        flairId: string,
        flairData: UpdateFlairData,
    ): Promise<CommunityFlair> {
        const updatePayload: any = {};

        if (flairData.flairText !== undefined) {
            updatePayload.flair_text = flairData.flairText;
        }
        if (flairData.flairColor !== undefined) {
            updatePayload.flair_color = flairData.flairColor;
        }
        if (flairData.flairBackgroundColor !== undefined) {
            updatePayload.flair_background_color =
                flairData.flairBackgroundColor;
        }
        if (flairData.isModOnly !== undefined) {
            updatePayload.is_mod_only = flairData.isModOnly;
        }

        const { data, error } = await supabase
            .from("community_flairs")
            .update(updatePayload)
            .eq("id", flairId)
            .select()
            .single();

        if (error) {
            console.error("Error updating flair:", error);
            throw new Error(`Failed to update flair: ${error.message}`);
        }

        return {
            id: data.id,
            communityId: data.community_id,
            flairText: data.flair_text,
            flairColor: data.flair_color,
            flairBackgroundColor: data.flair_background_color,
            flairType: data.flair_type,
            isModOnly: data.is_mod_only,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Delete a flair template
     * @param flairId - Flair ID
     * @returns Promise<boolean>
     */
    static async deleteFlair(flairId: string): Promise<boolean> {
        const { error } = await supabase
            .from("community_flairs")
            .delete()
            .eq("id", flairId);

        if (error) {
            console.error("Error deleting flair:", error);
            throw new Error(`Failed to delete flair: ${error.message}`);
        }

        return true;
    }

    /**
     * Assign or update a user's flair in a community
     * @param communityId - Community ID
     * @param userId - User ID
     * @param flairData - Flair assignment data
     * @returns Promise<UserFlair>
     */
    static async assignUserFlair(
        communityId: string,
        userId: string,
        flairData: AssignUserFlairData,
    ): Promise<UserFlair> {
        const { data, error } = await supabase
            .from("user_flairs")
            .upsert({
                community_id: communityId,
                user_id: userId,
                flair_id: flairData.flairId,
                custom_text: flairData.customText,
            })
            .select(`
        *,
        flair:flair_id (
          id,
          flair_text,
          flair_color,
          flair_background_color,
          flair_type,
          is_mod_only
        )
      `)
            .single();

        if (error) {
            console.error("Error assigning user flair:", error);
            throw new Error(`Failed to assign user flair: ${error.message}`);
        }

        return {
            id: data.id,
            communityId: data.community_id,
            userId: data.user_id,
            flairId: data.flair_id,
            customText: data.custom_text,
            flair: data.flair
                ? {
                    id: data.flair.id,
                    communityId: communityId,
                    flairText: data.flair.flair_text,
                    flairColor: data.flair.flair_color,
                    flairBackgroundColor: data.flair.flair_background_color,
                    flairType: data.flair.flair_type,
                    isModOnly: data.flair.is_mod_only,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                }
                : undefined,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Get a user's flair in a community
     * @param communityId - Community ID
     * @param userId - User ID
     * @returns Promise<UserFlair | null>
     */
    static async getUserFlair(
        communityId: string,
        userId: string,
    ): Promise<UserFlair | null> {
        const { data, error } = await supabase
            .from("user_flairs")
            .select(`
        *,
        flair:flair_id (
          id,
          community_id,
          flair_text,
          flair_color,
          flair_background_color,
          flair_type,
          is_mod_only,
          created_at,
          updated_at
        )
      `)
            .eq("community_id", communityId)
            .eq("user_id", userId)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                // No rows returned - user has no flair
                return null;
            }
            console.error("Error fetching user flair:", error);
            throw new Error(`Failed to fetch user flair: ${error.message}`);
        }

        if (!data) return null;

        return {
            id: data.id,
            communityId: data.community_id,
            userId: data.user_id,
            flairId: data.flair_id,
            customText: data.custom_text,
            flair: data.flair
                ? {
                    id: data.flair.id,
                    communityId: data.flair.community_id,
                    flairText: data.flair.flair_text,
                    flairColor: data.flair.flair_color,
                    flairBackgroundColor: data.flair.flair_background_color,
                    flairType: data.flair.flair_type,
                    isModOnly: data.flair.is_mod_only,
                    createdAt: data.flair.created_at,
                    updatedAt: data.flair.updated_at,
                }
                : undefined,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Remove a user's flair
     * @param communityId - Community ID
     * @param userId - User ID
     * @returns Promise<boolean>
     */
    static async removeUserFlair(
        communityId: string,
        userId: string,
    ): Promise<boolean> {
        const { error } = await supabase
            .from("user_flairs")
            .delete()
            .eq("community_id", communityId)
            .eq("user_id", userId);

        if (error) {
            console.error("Error removing user flair:", error);
            throw new Error(`Failed to remove user flair: ${error.message}`);
        }

        return true;
    }

    /**
     * Set a post's flair
     * @param postId - Post ID
     * @param flairId - Flair template ID
     * @returns Promise<PostFlair>
     */
    static async setPostFlair(
        postId: string,
        flairId: string,
    ): Promise<PostFlair> {
        const { data, error } = await supabase
            .from("post_flairs")
            .upsert({
                post_id: postId,
                flair_id: flairId,
            })
            .select(`
        *,
        flair:flair_id (
          id,
          community_id,
          flair_text,
          flair_color,
          flair_background_color,
          flair_type,
          is_mod_only,
          created_at,
          updated_at
        )
      `)
            .single();

        if (error) {
            console.error("Error setting post flair:", error);
            throw new Error(`Failed to set post flair: ${error.message}`);
        }

        return {
            id: data.id,
            postId: data.post_id,
            flairId: data.flair_id,
            flair: data.flair
                ? {
                    id: data.flair.id,
                    communityId: data.flair.community_id,
                    flairText: data.flair.flair_text,
                    flairColor: data.flair.flair_color,
                    flairBackgroundColor: data.flair.flair_background_color,
                    flairType: data.flair.flair_type,
                    isModOnly: data.flair.is_mod_only,
                    createdAt: data.flair.created_at,
                    updatedAt: data.flair.updated_at,
                }
                : undefined,
            createdAt: data.created_at,
        };
    }

    /**
     * Get a post's flair
     * @param postId - Post ID
     * @returns Promise<PostFlair | null>
     */
    static async getPostFlair(postId: string): Promise<PostFlair | null> {
        const { data, error } = await supabase
            .from("post_flairs")
            .select(`
        *,
        flair:flair_id (
          id,
          community_id,
          flair_text,
          flair_color,
          flair_background_color,
          flair_type,
          is_mod_only,
          created_at,
          updated_at
        )
      `)
            .eq("post_id", postId)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null;
            }
            console.error("Error fetching post flair:", error);
            throw new Error(`Failed to fetch post flair: ${error.message}`);
        }

        if (!data) return null;

        return {
            id: data.id,
            postId: data.post_id,
            flairId: data.flair_id,
            flair: data.flair
                ? {
                    id: data.flair.id,
                    communityId: data.flair.community_id,
                    flairText: data.flair.flair_text,
                    flairColor: data.flair.flair_color,
                    flairBackgroundColor: data.flair.flair_background_color,
                    flairType: data.flair.flair_type,
                    isModOnly: data.flair.is_mod_only,
                    createdAt: data.flair.created_at,
                    updatedAt: data.flair.updated_at,
                }
                : undefined,
            createdAt: data.created_at,
        };
    }

    /**
     * Remove a post's flair
     * @param postId - Post ID
     * @returns Promise<boolean>
     */
    static async removePostFlair(postId: string): Promise<boolean> {
        const { error } = await supabase
            .from("post_flairs")
            .delete()
            .eq("post_id", postId);

        if (error) {
            console.error("Error removing post flair:", error);
            throw new Error(`Failed to remove post flair: ${error.message}`);
        }

        return true;
    }
}
