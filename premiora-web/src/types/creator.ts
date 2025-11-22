// Creator Channel Types

export interface SubscriptionBenefit {
    id: string;
    description: string;
}

export interface SubscriptionTier {
    id: string;
    name: string;
    price: number;
    currency: string;
    description: string;
    color: string;
    benefits: SubscriptionBenefit[];
}

export interface CreatorChannelConfig {
    id: string;
    userId: string;
    subscriptionTiers: SubscriptionTier[];
    connectedCommunityId?: string;
    isSetupCompleted: boolean;
}
