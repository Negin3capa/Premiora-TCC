export type SocialNotificationType =
    | "like"
    | "comment"
    | "follow"
    | "reply"
    | "subscribe";

export interface SocialNotification {
    id: string;
    user_id: string;
    actor_id: string;
    type: SocialNotificationType;
    entity_id?: string;
    metadata: {
        post_id?: string;
        comment_id?: string;
        parent_id?: string;
        content?: string;
        [key: string]: any;
    };
    is_read: boolean;
    created_at: string;
    actor?: {
        username: string;
        name: string;
        avatar_url: string;
    };
}
