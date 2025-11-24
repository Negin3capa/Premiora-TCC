import { supabase } from "../../utils/supabaseClient";
import { supabaseAdmin } from "../../utils/supabaseAdminClient";
import type {
    CreatorChannelConfig,
    SubscriptionTier,
} from "../../types/creator";
import type { Community } from "../../types/community";

export class CreatorChannelService {
    /**
     * Busca o canal do criador com seus níveis de assinatura e benefícios
     */
    static async getCreatorChannel(
        creatorId: string,
    ): Promise<CreatorChannelConfig | null> {
        try {
            const { data: channel, error } = await supabase
                .from("creator_channels")
                .select(`
          *,
          subscription_tiers (
            *,
            subscription_benefits (*)
          )
        `)
                .eq("id", creatorId)
                .single();

            if (error) {
                if (error.code === "PGRST116") return null; // Not found
                throw error;
            }

            // Formatar dados para o tipo CreatorChannelConfig
            const tiers: SubscriptionTier[] = (channel.subscription_tiers || [])
                .sort((a: any, b: any) => a.tier_order - b.tier_order)
                .map((tier: any) => ({
                    id: tier.id,
                    name: tier.name,
                    price: tier.price,
                    currency: tier.currency,
                    description: tier.description,
                    color: tier.color,
                    benefits: (tier.subscription_benefits || [])
                        .sort((a: any, b: any) =>
                            a.benefit_order - b.benefit_order
                        )
                        .map((benefit: any) => ({
                            id: benefit.id,
                            description: benefit.description,
                        })),
                }));

            return {
                id: channel.id,
                userId: channel.id,
                subscriptionTiers: tiers,
                connectedCommunityId: channel.connected_community_id,
                stripeConnectId: channel.stripe_connect_id,
                isSetupCompleted: channel.is_setup_completed,
            };
        } catch (err) {
            console.error(
                "Error fetching creator channel:",
                JSON.stringify(err, null, 2),
            );
            return null;
        }
    }

    /**
     * Salva a configuração do canal do criador
     * Uses supabaseAdmin to bypass RLS policies
     */
    static async saveCreatorChannel(
        creatorId: string,
        config: CreatorChannelConfig,
    ): Promise<boolean> {
        try {
            // 1. Upsert do canal (using admin to bypass RLS)
            const { error: channelError } = await supabaseAdmin
                .from("creator_channels")
                .upsert({
                    id: creatorId,
                    connected_community_id: config.connectedCommunityId,
                    is_setup_completed: true,
                    updated_at: new Date().toISOString(),
                });

            if (channelError) throw channelError;

            // 2. Sincronizar tiers
            // Primeiro, buscar tiers existentes para deletar (cascade deletará benefícios)
            const { data: existingTiers } = await supabaseAdmin
                .from("subscription_tiers")
                .select("id")
                .eq("creator_channel_id", creatorId);

            const existingIds = existingTiers
                ? existingTiers.map((t) => t.id)
                : [];

            if (existingIds.length > 0) {
                // Manter IDs que ainda existem no config novo, deletar os que não existem
                const configIds = config.subscriptionTiers.map((t) => t.id)
                    .filter((id) => !id.startsWith("temp-"));

                const idsToDelete = existingIds.filter((id) =>
                    !configIds.includes(id)
                );

                if (idsToDelete.length > 0) {
                    await supabaseAdmin
                        .from("subscription_tiers")
                        .delete()
                        .in("id", idsToDelete);
                }
            }

            // Upsert dos tiers
            for (let i = 0; i < config.subscriptionTiers.length; i++) {
                const tier = config.subscriptionTiers[i];
                const isTempId = !tier.id || tier.id.startsWith("temp-");

                const tierData = {
                    creator_channel_id: creatorId,
                    name: tier.name,
                    price: tier.price,
                    currency: tier.currency,
                    description: tier.description,
                    color: tier.color,
                    tier_order: i,
                };

                let tierId = tier.id;

                if (isTempId) {
                    // Insert new tier with auto-generated ID
                    const { data: newTier, error: tierError } =
                        await supabaseAdmin
                            .from("subscription_tiers")
                            .insert(tierData)
                            .select("id")
                            .single();

                    if (tierError) throw tierError;
                    tierId = newTier.id;
                } else {
                    // Try to update existing tier (securely checking ownership)
                    const { data: updatedRows, error: updateError } =
                        await supabaseAdmin
                            .from("subscription_tiers")
                            .update(tierData)
                            .eq("id", tierId)
                            .eq("creator_channel_id", creatorId) // Security check: must own the tier
                            .select("id");

                    if (updateError) throw updateError;

                    // If no rows updated, it means tier doesn't exist OR belongs to someone else
                    if (!updatedRows || updatedRows.length === 0) {
                        // Try to insert (will fail if ID exists but belongs to someone else)
                        const { error: insertError } = await supabaseAdmin
                            .from("subscription_tiers")
                            .insert({ id: tierId, ...tierData });

                        if (insertError) {
                            console.error(
                                `Failed to insert tier ${tierId}:`,
                                insertError,
                            );
                            throw insertError;
                        }
                    }
                }

                // Gerenciar benefícios do tier
                // Deletar benefícios antigos deste tier
                await supabaseAdmin
                    .from("subscription_benefits")
                    .delete()
                    .eq("subscription_tier_id", tierId);

                // Inserir novos benefícios
                if (tier.benefits.length > 0) {
                    const benefitsData = tier.benefits.map((
                        benefit,
                        index,
                    ) => ({
                        subscription_tier_id: tierId,
                        description: benefit.description,
                        benefit_order: index,
                    }));

                    const { error: benefitsError } = await supabaseAdmin
                        .from("subscription_benefits")
                        .insert(benefitsData);

                    if (benefitsError) throw benefitsError;
                }
            }

            return true;
        } catch (err) {
            console.error(
                "Error saving creator channel:",
                JSON.stringify(err, null, 2),
            );
            return false;
        }
    }

    /**
     * Busca detalhes da comunidade conectada
     */
    static async getConnectedCommunity(
        communityId: string,
    ): Promise<Community | null> {
        try {
            const { data, error } = await supabase
                .from("communities")
                .select("*")
                .eq("id", communityId)
                .single();

            if (error) throw error;

            return {
                id: data.id,
                name: data.name,
                displayName: data.display_name,
                description: data.description,
                bannerUrl: data.cover_image_url,
                avatarUrl: data.avatar_url,
                creatorId: data.creator_id,
                isPrivate: data.is_private,
                memberCount: data.member_count,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        } catch (err) {
            console.error("Error fetching connected community:", err);
            return null;
        }
    }

    /**
     * Busca todas as comunidades onde o usuário é dono/criador
     */
    static async getUserCommunities(userId: string): Promise<Community[]> {
        try {
            const { data, error } = await supabase
                .from("communities")
                .select("*")
                .eq("creator_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return (data || []).map((community) => ({
                id: community.id,
                name: community.name,
                displayName: community.display_name,
                description: community.description,
                bannerUrl: community.cover_image_url,
                avatarUrl: community.avatar_url,
                creatorId: community.creator_id,
                isPrivate: community.is_private,
                memberCount: community.member_count,
                createdAt: community.created_at,
                updatedAt: community.updated_at,
            }));
        } catch (err) {
            console.error("Error fetching user communities:", err);
            return [];
        }
    }
}
