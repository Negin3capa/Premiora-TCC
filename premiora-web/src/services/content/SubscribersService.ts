import { supabase } from '../../utils/supabaseClient';

export interface Subscriber {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    tierName: string;
    tierPrice: number;
    subscribedAt: string;
    status: 'active' | 'cancelled' | 'expired';
}

export class SubscribersService {
    /**
     * Busca todos os assinantes de um criador
     */
    static async getCreatorSubscribers(creatorId: string): Promise<Subscriber[]> {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
          id,
          user_id,
          tier_id,
          status,
          created_at,
          subscription_tiers (
            name,
            price
          ),
          profiles (
            username,
            avatar_url
          )
        `)
                .eq('creator_id', creatorId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar assinantes:', error);
                return [];
            }

            if (!data) return [];

            return data.map((sub: any) => ({
                id: sub.id,
                userId: sub.user_id,
                userName: sub.profiles?.username || 'Usuário',
                userAvatar: sub.profiles?.avatar_url || null,
                tierName: sub.subscription_tiers?.name || 'Plano',
                tierPrice: sub.subscription_tiers?.price || 0,
                subscribedAt: sub.created_at,
                status: sub.status
            }));
        } catch (error) {
            console.error('Erro ao buscar assinantes:', error);
            return [];
        }
    }

    /**
     * Busca estatísticas dos assinantes
     */
    static async getSubscriberStats(creatorId: string) {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('status, subscription_tiers(price)')
                .eq('creator_id', creatorId);

            if (error || !data) {
                return {
                    total: 0,
                    active: 0,
                    cancelled: 0,
                    monthlyRevenue: 0
                };
            }

            const stats = {
                total: data.length,
                active: data.filter((s: any) => s.status === 'active').length,
                cancelled: data.filter((s: any) => s.status === 'cancelled').length,
                monthlyRevenue: data
                    .filter((s: any) => s.status === 'active')
                    .reduce((sum: number, s: any) => sum + (s.subscription_tiers?.price || 0), 0)
            };

            return stats;
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return {
                total: 0,
                active: 0,
                cancelled: 0,
                monthlyRevenue: 0
            };
        }
    }
}
