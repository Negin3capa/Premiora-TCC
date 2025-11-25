import { supabase } from "../utils/supabaseClient";
import type { SocialNotification } from "../types/socialNotification";

export class NotificationService {
    /**
     * Busca as notificações do usuário logado
     * @param limit Limite de notificações
     * @param offset Offset para paginação
     */
    static async getNotifications(
        limit = 20,
        offset = 0,
    ): Promise<SocialNotification[]> {
        const { data, error } = await supabase
            .from("notifications")
            .select(`
        *,
        actor:actor_id (
          username,
          name,
          avatar_url
        )
      `)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Erro ao buscar notificações:", error);
            throw error;
        }

        // Mapear para garantir que actor esteja no formato correto caso venha como array ou objeto
        return (data || []).map((notification) => ({
            ...notification,
            actor: Array.isArray(notification.actor)
                ? notification.actor[0]
                : notification.actor,
        }));
    }

    /**
     * Marca uma notificação como lida
     * @param id ID da notificação
     */
    static async markAsRead(id: string): Promise<void> {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (error) {
            console.error("Erro ao marcar notificação como lida:", error);
            throw error;
        }
    }

    /**
     * Marca todas as notificações como lidas
     */
    static async markAllAsRead(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (error) {
            console.error("Erro ao marcar todas como lidas:", error);
            throw error;
        }
    }

    /**
     * Obtém a contagem de notificações não lidas
     */
    static async getUnreadCount(): Promise<number> {
        const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("is_read", false);

        if (error) {
            console.error("Erro ao buscar contagem de não lidas:", error);
            return 0;
        }

        return count || 0;
    }
    /**
     * Busca uma notificação específica pelo ID
     * @param id ID da notificação
     */
    static async getNotificationById(
        id: string,
    ): Promise<SocialNotification | null> {
        const { data, error } = await supabase
            .from("notifications")
            .select(`
        *,
        actor:actor_id (
          username,
          name,
          avatar_url
        )
      `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Erro ao buscar notificação:", error);
            return null;
        }

        return {
            ...data,
            actor: Array.isArray(data.actor) ? data.actor[0] : data.actor,
        };
    }
}
