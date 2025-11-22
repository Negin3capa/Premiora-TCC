/**
 * Service for managing community rules
 * Provides CRUD operations for community rules
 */

import { supabase } from "../../utils/supabaseClient";
import type {
    CommunityRule,
    CreateRuleData,
    UpdateRuleData,
} from "../../types/community";

export class CommunityRulesService {
    /**
     * Get all rules for a community
     * @param communityId - Community ID
     * @returns Promise<CommunityRule[]>
     */
    static async getCommunityRules(
        communityId: string,
    ): Promise<CommunityRule[]> {
        const { data, error } = await supabase
            .from("community_rules")
            .select("*")
            .eq("community_id", communityId)
            .order("rule_order", { ascending: true });

        if (error) {
            console.error("Error fetching community rules:", error);
            throw new Error(
                `Failed to fetch community rules: ${error.message}`,
            );
        }

        return data.map((rule) => ({
            id: rule.id,
            communityId: rule.community_id,
            title: rule.title,
            description: rule.description,
            ruleOrder: rule.rule_order,
            createdAt: rule.created_at,
            updatedAt: rule.updated_at,
        }));
    }

    /**
     * Create a new community rule
     * @param communityId - Community ID
     * @param ruleData - Rule data
     * @returns Promise<CommunityRule>
     */
    static async createRule(
        communityId: string,
        ruleData: CreateRuleData,
    ): Promise<CommunityRule> {
        const { data, error } = await supabase
            .from("community_rules")
            .insert({
                community_id: communityId,
                title: ruleData.title,
                description: ruleData.description,
                rule_order: ruleData.ruleOrder,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating community rule:", error);
            throw new Error(
                `Failed to create community rule: ${error.message}`,
            );
        }

        return {
            id: data.id,
            communityId: data.community_id,
            title: data.title,
            description: data.description,
            ruleOrder: data.rule_order,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Update an existing community rule
     * @param ruleId - Rule ID
     * @param ruleData - Updated rule data
     * @returns Promise<CommunityRule>
     */
    static async updateRule(
        ruleId: string,
        ruleData: UpdateRuleData,
    ): Promise<CommunityRule> {
        const updatePayload: any = {};

        if (ruleData.title !== undefined) updatePayload.title = ruleData.title;
        if (ruleData.description !== undefined) {
            updatePayload.description = ruleData.description;
        }
        if (ruleData.ruleOrder !== undefined) {
            updatePayload.rule_order = ruleData.ruleOrder;
        }

        const { data, error } = await supabase
            .from("community_rules")
            .update(updatePayload)
            .eq("id", ruleId)
            .select()
            .single();

        if (error) {
            console.error("Error updating community rule:", error);
            throw new Error(
                `Failed to update community rule: ${error.message}`,
            );
        }

        return {
            id: data.id,
            communityId: data.community_id,
            title: data.title,
            description: data.description,
            ruleOrder: data.rule_order,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    /**
     * Delete a community rule
     * @param ruleId - Rule ID
     * @returns Promise<boolean>
     */
    static async deleteRule(ruleId: string): Promise<boolean> {
        const { error } = await supabase
            .from("community_rules")
            .delete()
            .eq("id", ruleId);

        if (error) {
            console.error("Error deleting community rule:", error);
            throw new Error(
                `Failed to delete community rule: ${error.message}`,
            );
        }

        return true;
    }

    /**
     * Reorder community rules
     * @param communityId - Community ID
     * @param ruleIds - Array of rule IDs in desired order
     * @returns Promise<boolean>
     */
    static async reorderRules(
        communityId: string,
        ruleIds: string[],
    ): Promise<boolean> {
        try {
            // Update each rule with its new order
            const updates = ruleIds.map((ruleId, index) =>
                supabase
                    .from("community_rules")
                    .update({ rule_order: index + 1 })
                    .eq("id", ruleId)
                    .eq("community_id", communityId)
            );

            await Promise.all(updates);
            return true;
        } catch (error) {
            console.error("Error reordering community rules:", error);
            throw new Error("Failed to reorder community rules");
        }
    }
}
